from __future__ import annotations

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import DayLog, DayStatus, Goal, GoalEntry, User
from app.schemas import DayLogOut, DayUpdateIn, StatsOut
from app.security import get_current_user
from app.services.scoring import EntryInput, compute_score
from app.services.stats import compute_stats

router = APIRouter(tags=["day-logs"])


def _today() -> date:
    # Por enquanto usa UTC. TODO: timezone do usuário no perfil.
    return datetime.now(timezone.utc).date()


def _reject_future(target: date) -> None:
    if target > _today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Não é possível registrar dias futuros.")


def _get_owned_log(db: Session, user: User, target: date) -> DayLog | None:
    return db.execute(
        select(DayLog)
        .options(selectinload(DayLog.entries))
        .where(DayLog.user_id == user.id, DayLog.date == target)
    ).scalar_one_or_none()


@router.get("/day-logs", response_model=list[DayLogOut])
def list_day_logs(
    limit: int = Query(14, ge=1, le=90),
    before: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[DayLog]:
    stmt = (
        select(DayLog)
        .options(selectinload(DayLog.entries))
        .where(DayLog.user_id == user.id)
        .order_by(DayLog.date.desc())
        .limit(limit)
    )
    if before is not None:
        stmt = stmt.where(DayLog.date < before)
    return list(db.execute(stmt).scalars().all())


@router.get("/day-logs/{target_date}", response_model=DayLogOut)
def get_day_log(
    target_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog | DayLogOut:
    log = _get_owned_log(db, user, target_date)
    if log is None:
        # Dia ainda não registrado: devolve um DayLog "vazio" (não persiste).
        # O front cruza as metas ativas do dia da semana via /goals.
        return DayLogOut(date=target_date, status=DayStatus.registered, score=None)
    return log


@router.put("/day-logs/{target_date}", response_model=DayLogOut)
def save_day(
    target_date: date,
    payload: DayUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog:
    """Salva progresso parcial. Upsert dos GoalEntries, recalcula score. Não finaliza."""
    _reject_future(target_date)

    goal_ids = [e.goal_id for e in payload.entries]
    goals_by_id: dict = {}
    if goal_ids:
        goals = db.execute(
            select(Goal).where(Goal.user_id == user.id, Goal.id.in_(goal_ids))
        ).scalars()
        goals_by_id = {g.id: g for g in goals}
        if len(goals_by_id) != len(set(goal_ids)):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Uma ou mais metas não pertencem a você."
            )

    log = _get_owned_log(db, user, target_date)
    if log is None:
        log = DayLog(user_id=user.id, date=target_date, status=DayStatus.registered)
        db.add(log)
        db.flush()
    else:
        log.status = DayStatus.registered

    # Upsert das entries: atualiza existentes, cria novas, remove as ausentes.
    existing = {e.goal_id: e for e in log.entries}
    keep_goal_ids = set(goal_ids)
    for entry in list(log.entries):
        if entry.goal_id not in keep_goal_ids:
            db.delete(entry)

    score_inputs: list[EntryInput] = []
    for e in payload.entries:
        goal = goals_by_id[e.goal_id]
        entry = existing.get(e.goal_id)
        if entry is None:
            entry = GoalEntry(day_log_id=log.id, goal_id=goal.id)
            db.add(entry)
        entry.weight = goal.weight
        entry.level = e.level
        entry.done_at = e.done_at
        score_inputs.append(EntryInput(weight=goal.weight, level=e.level))

    log.mood = payload.mood
    log.note = payload.note
    log.score = compute_score(score_inputs)

    db.commit()
    db.refresh(log)
    return log


@router.post("/day-logs/{target_date}/finalize", response_model=DayLogOut)
def finalize_day(
    target_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog:
    """Consolida o dia e marca finalized=true. Idempotente."""
    log = _get_owned_log(db, user, target_date)
    if log is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "Salve o progresso do dia antes de finalizar."
        )
    log.status = DayStatus.registered
    log.score = compute_score(
        EntryInput(weight=e.weight, level=e.level) for e in log.entries
    )
    log.finalized = True
    db.commit()
    db.refresh(log)
    return log


@router.post("/day-logs/{target_date}/dayoff", response_model=DayLogOut)
def day_off(
    target_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog:
    """Marca o dia como day_off. Pode ser chamado a qualquer momento (só rejeita futuro)."""
    _reject_future(target_date)

    log = _get_owned_log(db, user, target_date)
    if log is None:
        log = DayLog(user_id=user.id, date=target_date, status=DayStatus.day_off, score=None)
        db.add(log)
    else:
        log.status = DayStatus.day_off
        log.score = None
        log.finalized = False
        for entry in list(log.entries):
            db.delete(entry)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/day-logs/{target_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day_log(
    target_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    log = _get_owned_log(db, user, target_date)
    if log is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dia não encontrado.")
    db.delete(log)
    db.commit()


@router.get("/stats", response_model=StatsOut)
def stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StatsOut:
    return compute_stats(db, user.id, _today())

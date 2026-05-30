from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import DayLog, DayStatus, Goal, GoalEntry, User
from app.schemas import CheckInIn, DayLogOut, DayOffIn, StatsOut
from app.security import get_current_user
from app.services.scoring import EntryInput, compute_score
from app.services.stats import compute_stats

router = APIRouter(tags=["day-logs"])

CHECKIN_WINDOW = timedelta(hours=48)


def _today(user_tz_offset_minutes: int = 0) -> date:
    # Por enquanto usa UTC. TODO: timezone do usuário no perfil.
    return datetime.now(timezone.utc).date()


def _ensure_within_window(target: date) -> None:
    if target > _today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Não é possível registrar dias futuros.")
    end_of_target = datetime.combine(target + timedelta(days=1), datetime.min.time(), timezone.utc)
    if datetime.now(timezone.utc) > end_of_target + CHECKIN_WINDOW:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Janela de 48h para registrar este dia já expirou.",
        )


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
) -> DayLog:
    log = db.execute(
        select(DayLog)
        .options(selectinload(DayLog.entries))
        .where(DayLog.user_id == user.id, DayLog.date == target_date)
    ).scalar_one_or_none()
    if log is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dia ainda não registrado.")
    return log


@router.post("/day-logs/check-in", response_model=DayLogOut, status_code=status.HTTP_201_CREATED)
def check_in(
    payload: CheckInIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog:
    _ensure_within_window(payload.date)

    goal_ids = [e.goal_id for e in payload.entries]
    if len(set(goal_ids)) != len(goal_ids):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Metas duplicadas no check-in.")

    goals = (
        db.execute(select(Goal).where(Goal.user_id == user.id, Goal.id.in_(goal_ids))).scalars()
        if goal_ids
        else []
    )
    goals_by_id = {g.id: g for g in goals}
    if len(goals_by_id) != len(goal_ids):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uma ou mais metas não pertencem a você.")

    log = db.execute(
        select(DayLog).where(DayLog.user_id == user.id, DayLog.date == payload.date)
    ).scalar_one_or_none()
    if log is None:
        log = DayLog(user_id=user.id, date=payload.date, status=DayStatus.registered)
        db.add(log)
        db.flush()
    else:
        log.status = DayStatus.registered
        # Substitui as entries (re-checkin sobrescreve).
        for entry in list(log.entries):
            db.delete(entry)
        db.flush()

    score_inputs: list[EntryInput] = []
    for e in payload.entries:
        goal = goals_by_id[e.goal_id]
        entry = GoalEntry(day_log_id=log.id, goal_id=goal.id, weight=goal.weight, level=e.level)
        db.add(entry)
        score_inputs.append(EntryInput(weight=goal.weight, level=e.level))

    log.score = compute_score(score_inputs)
    db.commit()
    db.refresh(log)
    return log


@router.post("/day-logs/day-off", response_model=DayLogOut, status_code=status.HTTP_201_CREATED)
def day_off(
    payload: DayOffIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DayLog:
    if payload.date > _today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Day Off não pode ser em data futura.")

    log = db.execute(
        select(DayLog).where(DayLog.user_id == user.id, DayLog.date == payload.date)
    ).scalar_one_or_none()
    if log is None:
        log = DayLog(user_id=user.id, date=payload.date, status=DayStatus.day_off, score=None)
        db.add(log)
    else:
        log.status = DayStatus.day_off
        log.score = None
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
    log = db.execute(
        select(DayLog).where(DayLog.user_id == user.id, DayLog.date == target_date)
    ).scalar_one_or_none()
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

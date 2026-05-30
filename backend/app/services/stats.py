from __future__ import annotations

import uuid
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DayLog, DayStatus
from app.schemas import StatsOut, StreakOut


def _streak(logs_by_date: dict[date, DayLog], today: date) -> StreakOut:
    # Streak conta a partir de hoje (ou ontem, se hoje ainda não foi registrado).
    # day_off mantém streak; missed quebra; ausência = não quebra ainda se for hoje.
    current = 0
    cursor = today
    while True:
        log = logs_by_date.get(cursor)
        if log is None:
            if cursor == today:
                cursor -= timedelta(days=1)
                continue
            break
        if log.status == DayStatus.missed:
            break
        if log.status in (DayStatus.registered, DayStatus.day_off):
            current += 1
            cursor -= timedelta(days=1)
            continue
        break

    # Recorde: maior streak já alcançado.
    record = 0
    run = 0
    for d in sorted(logs_by_date.keys()):
        log = logs_by_date[d]
        if log.status == DayStatus.missed:
            run = 0
            continue
        run += 1
        record = max(record, run)
    record = max(record, current)
    return StreakOut(current=current, record=record)


def compute_stats(db: Session, user_id: uuid.UUID, today: date) -> StatsOut:
    logs = db.execute(
        select(DayLog).where(DayLog.user_id == user_id).order_by(DayLog.date)
    ).scalars().all()
    if not logs:
        return StatsOut(
            streak=StreakOut(current=0, record=0),
            consistency=0.0,
            average_score=0.0,
            score_last_14=0.0,
            score_prev_14=0.0,
        )

    by_date = {log.date: log for log in logs}
    first = logs[0].date
    total_days = (today - first).days + 1

    registered = [log for log in logs if log.status == DayStatus.registered]
    consistency = round(len(registered) / total_days * 100, 2) if total_days > 0 else 0.0

    average = (
        round(sum(log.score for log in registered if log.score is not None) / len(registered), 2)
        if registered
        else 0.0
    )

    def _avg_in_window(start: date, end: date) -> float:
        scores = [
            log.score
            for log in registered
            if log.score is not None and start <= log.date <= end
        ]
        return round(sum(scores) / len(scores), 2) if scores else 0.0

    last_start = today - timedelta(days=13)
    prev_end = last_start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=13)

    return StatsOut(
        streak=_streak(by_date, today),
        consistency=consistency,
        average_score=average,
        score_last_14=_avg_in_window(last_start, today),
        score_prev_14=_avg_in_window(prev_start, prev_end),
    )

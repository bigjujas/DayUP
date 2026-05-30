from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import DayStatus, GoalCategory


# ---------- Auth ----------


class RegisterIn(BaseModel):
    email: EmailStr
    name: Annotated[str, Field(min_length=1, max_length=30)]
    password: Annotated[str, Field(min_length=8, max_length=128)]


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: EmailStr
    name: str
    created_at: datetime


# ---------- Goals ----------


class GoalIn(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=120)]
    category: GoalCategory
    weight: Annotated[int, Field(ge=1, le=3)] = 2
    days_of_week: list[int]

    @field_validator("days_of_week")
    @classmethod
    def _validate_days(cls, v: list[int]) -> list[int]:
        if not v:
            raise ValueError("days_of_week não pode ser vazio.")
        if any(d < 0 or d > 6 for d in v):
            raise ValueError("days_of_week aceita valores 0–6 (segunda=0, domingo=6).")
        return sorted(set(v))


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    category: GoalCategory
    weight: int
    days_of_week: list[int]
    archived_at: datetime | None


# ---------- Day logs / Check-in ----------


class GoalEntryIn(BaseModel):
    goal_id: uuid.UUID
    level: float

    @field_validator("level")
    @classmethod
    def _validate_level(cls, v: float) -> float:
        if v not in (0.0, 0.4, 0.7, 1.0):
            raise ValueError("level deve ser 0.0, 0.4, 0.7 ou 1.0.")
        return v


class CheckInIn(BaseModel):
    date: date
    entries: list[GoalEntryIn]


class DayOffIn(BaseModel):
    date: date


class GoalEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    goal_id: uuid.UUID
    weight: int
    level: float


class DayLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    date: date
    status: DayStatus
    score: float | None
    entries: list[GoalEntryOut] = []


# ---------- Stats ----------


class StreakOut(BaseModel):
    current: int
    record: int


class StatsOut(BaseModel):
    streak: StreakOut
    consistency: float            # % de dias registrados desde o início
    average_score: float          # média de todos os scores registrados
    score_last_14: float          # média dos últimos 14 dias com score
    score_prev_14: float          # média dos 14 dias anteriores (para variação)

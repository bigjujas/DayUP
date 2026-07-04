from __future__ import annotations

import re
import uuid
from datetime import date, datetime, time
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models import DayStatus, GoalCategory

_PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,128}$")

# Conjunto fixo de moods permitidos (espelha o seletor do front).
ALLOWED_MOODS = {"😄", "🙂", "😐", "😞", "😫"}
VALID_LEVELS = (0.0, 0.4, 0.7, 1.0)


# ---------- Auth ----------


class RegisterIn(BaseModel):
    email: EmailStr
    name: Annotated[str, Field(min_length=2, max_length=30, strip_whitespace=True)]
    password: Annotated[str, Field(min_length=8, max_length=128)]
    confirm_password: Annotated[str, Field(min_length=8, max_length=128)]

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        if "<" in v or ">" in v:
            raise ValueError("Nome inválido.")
        return v

    @model_validator(mode="after")
    def _validate_passwords(self) -> "RegisterIn":
        if self.password != self.confirm_password:
            raise ValueError("As senhas não conferem.")
        if not _PASSWORD_RE.match(self.password):
            raise ValueError("A senha precisa ter pelo menos 8 caracteres, com letras e números.")
        return self


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UpdateNameIn(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=30, strip_whitespace=True)]

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        if "<" in v or ">" in v:
            raise ValueError("Nome inválido.")
        return v


class ChangeEmailIn(BaseModel):
    new_email: EmailStr
    confirm_new_email: EmailStr
    password: str

    @model_validator(mode="after")
    def _validate_match(self) -> "ChangeEmailIn":
        if self.new_email.lower() != self.confirm_new_email.lower():
            raise ValueError("Os e-mails não conferem.")
        return self


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: Annotated[str, Field(min_length=8, max_length=128)]
    confirm_new_password: Annotated[str, Field(min_length=8, max_length=128)]

    @model_validator(mode="after")
    def _validate_passwords(self) -> "ChangePasswordIn":
        if self.new_password != self.confirm_new_password:
            raise ValueError("As senhas não conferem.")
        if not _PASSWORD_RE.match(self.new_password):
            raise ValueError("A senha precisa ter pelo menos 8 caracteres, com letras e números.")
        return self


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: EmailStr
    name: str
    email_verified: bool = False
    onboarding_seen: bool = False
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
    done_at: time | None = None

    @field_validator("level")
    @classmethod
    def _validate_level(cls, v: float) -> float:
        if v not in VALID_LEVELS:
            raise ValueError("level deve ser 0.0, 0.4, 0.7 ou 1.0.")
        return v


class DayUpdateIn(BaseModel):
    """Salvar progresso parcial de um dia (PUT). Não finaliza."""

    mood: str | None = None
    note: Annotated[str | None, Field(max_length=1000)] = None
    entries: list[GoalEntryIn] = []

    @field_validator("mood")
    @classmethod
    def _validate_mood(cls, v: str | None) -> str | None:
        if v is not None and v not in ALLOWED_MOODS:
            raise ValueError("mood inválido.")
        return v

    @field_validator("entries")
    @classmethod
    def _validate_unique_goals(cls, v: list[GoalEntryIn]) -> list[GoalEntryIn]:
        goal_ids = [e.goal_id for e in v]
        if len(set(goal_ids)) != len(goal_ids):
            raise ValueError("Metas duplicadas na lista de avaliações.")
        return v


class GoalEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    goal_id: uuid.UUID
    weight: int
    level: float
    done_at: time | None = None


class DayLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID | None = None
    date: date
    status: DayStatus
    score: float | None
    mood: str | None = None
    note: str | None = None
    finalized: bool = False
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

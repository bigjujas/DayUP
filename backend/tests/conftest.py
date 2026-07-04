"""Fixtures de teste para os endpoints.

Os testes de endpoint usam o banco configurado em DATABASE_URL (Postgres local
via docker-compose). Autenticação é simulada sobrescrevendo get_current_user —
assim não precisamos lidar com cookies de sessão/CSRF nos testes.

Testes de validação (422) e de data futura (400) não tocam o banco e rodam
mesmo sem Postgres no ar; só os de autorização exigem o banco.
"""
from __future__ import annotations

import uuid
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.db import SessionLocal, get_db
from app.main import app
from app.models import Goal, GoalCategory, User
from app.security import get_current_user, hash_password


@pytest.fixture
def db() -> Iterator[SessionLocal]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def make_user(db):
    """Cria usuários reais no banco e os remove (cascade) ao fim do teste."""
    created_ids: list[uuid.UUID] = []

    def _make() -> User:
        user = User(
            email=f"test-{uuid.uuid4().hex}@example.com",
            name="Tester",
            password_hash=hash_password("password123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created_ids.append(user.id)
        return user

    yield _make

    for uid in created_ids:
        obj = db.get(User, uid)
        if obj is not None:
            db.delete(obj)
    db.commit()


@pytest.fixture
def make_goal(db):
    """Cria metas reais para um usuário (ativas todos os dias)."""
    created_ids: list[uuid.UUID] = []

    def _make(user: User, weight: int = 2) -> Goal:
        goal = Goal(
            user_id=user.id,
            name="Meta de teste",
            category=GoalCategory.health,
            weight=weight,
            days_of_week=[0, 1, 2, 3, 4, 5, 6],
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)
        created_ids.append(goal.id)
        return goal

    yield _make

    for gid in created_ids:
        obj = db.get(Goal, gid)
        if obj is not None:
            db.delete(obj)
    db.commit()


@pytest.fixture
def client() -> Iterator[TestClient]:
    def _override_get_db():
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def as_user(client: TestClient):
    """Retorna um TestClient autenticado como o usuário informado."""

    def _login(user: User) -> TestClient:
        app.dependency_overrides[get_current_user] = lambda: user
        return client

    return _login

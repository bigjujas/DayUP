"""Testes dos endpoints da tela Hoje: validação, data futura e autorização.

Os testes de validação/data-futura não tocam o banco. Os de autorização exigem
o Postgres local no ar (docker-compose up).
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from app.main import app
from app.models import User
from app.security import get_current_user

TODAY = date.today().isoformat()
FUTURE = (date.today() + timedelta(days=2)).isoformat()


def _transient_user() -> User:
    """Usuário desanexado (sem banco) — só serve para satisfazer a autenticação."""
    return User(
        id=uuid.uuid4(),
        email=f"{uuid.uuid4().hex}@example.com",
        name="X",
        password_hash="x",
    )


def _auth_as_transient() -> None:
    app.dependency_overrides[get_current_user] = lambda: _transient_user()


# ───────────────────────── Validações (sem banco) ─────────────────────────


def test_put_level_invalido_retorna_422(client):
    _auth_as_transient()
    resp = client.put(
        f"/day-logs/{TODAY}",
        json={"entries": [{"goal_id": str(uuid.uuid4()), "level": 0.5}]},
    )
    assert resp.status_code == 422


def test_put_mood_invalido_retorna_422(client):
    _auth_as_transient()
    resp = client.put(f"/day-logs/{TODAY}", json={"mood": "🤖", "entries": []})
    assert resp.status_code == 422


def test_put_note_muito_longa_retorna_422(client):
    _auth_as_transient()
    resp = client.put(f"/day-logs/{TODAY}", json={"note": "a" * 1001, "entries": []})
    assert resp.status_code == 422


def test_put_data_futura_retorna_400(client):
    _auth_as_transient()
    resp = client.put(f"/day-logs/{FUTURE}", json={"entries": []})
    assert resp.status_code == 400


# ───────────────────────── Autorização (precisa de banco) ─────────────────────────


def test_get_dia_de_outro_usuario_nao_vaza_dados(client, as_user, make_user):
    user_a = make_user()
    user_b = make_user()

    # A salva um dia com mood/note.
    client_a = as_user(user_a)
    saved = client_a.put(
        f"/day-logs/{TODAY}",
        json={"mood": "🙂", "note": "dia do A", "entries": []},
    )
    assert saved.status_code == 200

    # B consulta o mesmo dia: recebe um dia vazio, sem os dados do A.
    client_b = as_user(user_b)
    resp = client_b.get(f"/day-logs/{TODAY}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["mood"] is None
    assert body["note"] is None
    assert body["id"] is None
    assert body["entries"] == []


def test_put_com_meta_de_outro_usuario_retorna_400(client, as_user, make_user, make_goal):
    user_a = make_user()
    user_b = make_user()
    goal_a = make_goal(user_a)

    client_b = as_user(user_b)
    resp = client_b.put(
        f"/day-logs/{TODAY}",
        json={"entries": [{"goal_id": str(goal_a.id), "level": 1.0}]},
    )
    assert resp.status_code == 400


def test_fluxo_salvar_e_finalizar(client, as_user, make_user, make_goal):
    user = make_user()
    goal = make_goal(user, weight=3)
    client_u = as_user(user)

    # Salva progresso parcial.
    saved = client_u.put(
        f"/day-logs/{TODAY}",
        json={
            "mood": "😄",
            "note": "foi bem",
            "entries": [{"goal_id": str(goal.id), "level": 1.0, "done_at": "07:30:00"}],
        },
    )
    assert saved.status_code == 200
    body = saved.json()
    assert body["score"] == 100
    assert body["finalized"] is False
    assert body["mood"] == "😄"
    assert body["entries"][0]["done_at"] == "07:30:00"

    # Finaliza.
    finalized = client_u.post(f"/day-logs/{TODAY}/finalize")
    assert finalized.status_code == 200
    assert finalized.json()["finalized"] is True

    # Finalizar de novo é idempotente.
    again = client_u.post(f"/day-logs/{TODAY}/finalize")
    assert again.status_code == 200
    assert again.json()["finalized"] is True


def test_finalize_sem_salvar_retorna_404(client, as_user, make_user):
    user = make_user()
    client_u = as_user(user)
    resp = client_u.post(f"/day-logs/{TODAY}/finalize")
    assert resp.status_code == 404

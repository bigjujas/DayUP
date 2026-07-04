"""Session storage in Redis.

A cookie carries an opaque `session_id` (`secrets.token_urlsafe(32)`); the
mapping `session_id → user_id` lives here, keyed under `dayup:sess:<id>` with
a TTL matching the cookie's `max_age`. Logout deletes the key so the cookie
becomes useless even if it leaks.
"""
from __future__ import annotations

import secrets
from functools import lru_cache

import redis

from app.config import Settings

_KEY_PREFIX = "dayup:sess:"


@lru_cache(maxsize=1)
def _get_redis() -> redis.Redis:
    # Settings é cacheado via get_settings(), mas evitamos depender dele aqui
    # importando preguiçosamente quando o singleton é montado.
    from app.config import get_settings

    settings = get_settings()
    return redis.Redis.from_url(settings.redis_url, decode_responses=True)


def _key(session_id: str) -> str:
    return f"{_KEY_PREFIX}{session_id}"


def create_session(user_id: str, settings: Settings) -> str:
    """Cria uma nova sessão e retorna o session_id opaco."""
    session_id = secrets.token_urlsafe(32)
    _get_redis().setex(_key(session_id), settings.session_max_age_seconds, user_id)
    return session_id


def read_session(session_id: str | None) -> str | None:
    """Retorna o user_id se a sessão existir e estiver válida, senão None."""
    if not session_id:
        return None
    value = _get_redis().get(_key(session_id))
    # Com decode_responses=True o tipo é str ou None.
    return value if isinstance(value, str) else None


def delete_session(session_id: str | None) -> None:
    if not session_id:
        return
    _get_redis().delete(_key(session_id))

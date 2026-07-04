"""Rate limiting via Redis (INCR + EXPIRE, sem libs externas)."""
from __future__ import annotations

from fastapi import HTTPException, status

from app.sessions import _get_redis

_KEY_PREFIX = "dayup:rl:"


def hit(key: str, limit: int, window_seconds: int) -> bool:
    """Incrementa o contador da chave. Retorna True se ainda dentro do limite."""
    r = _get_redis()
    full = f"{_KEY_PREFIX}{key}"
    count = r.incr(full)
    if count == 1:
        r.expire(full, window_seconds)
    return int(count) <= limit


def enforce(key: str, limit: int, window_seconds: int) -> None:
    """Lança 429 se a chave estourou o limite na janela."""
    if not hit(key, limit, window_seconds):
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Muitas tentativas. Tente novamente em alguns minutos.",
        )

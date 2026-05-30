from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, Request, Response, status
from itsdangerous import BadSignature, SignatureExpired, TimestampSigner
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.models import User

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def _signer(settings: Settings) -> TimestampSigner:
    return TimestampSigner(settings.session_secret, salt="dayup.session")


def _set_cookie(
    response: Response,
    name: str,
    value: str,
    *,
    settings: Settings,
    http_only: bool,
) -> None:
    response.set_cookie(
        key=name,
        value=value,
        max_age=settings.session_max_age_seconds,
        httponly=http_only,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )


def issue_session(response: Response, user: User, settings: Settings) -> str:
    """Sets the session and CSRF cookies, returns the CSRF token (also exposed via header)."""
    token = _signer(settings).sign(str(user.id)).decode("utf-8")
    csrf_token = secrets.token_urlsafe(32)
    _set_cookie(response, settings.session_cookie_name, token, settings=settings, http_only=True)
    # CSRF cookie is readable by JS so the SPA can echo it back as a header (double-submit pattern).
    _set_cookie(response, settings.csrf_cookie_name, csrf_token, settings=settings, http_only=False)
    response.headers[settings.csrf_header_name] = csrf_token
    return csrf_token


def clear_session(response: Response, settings: Settings) -> None:
    response.delete_cookie(settings.session_cookie_name, path="/")
    response.delete_cookie(settings.csrf_cookie_name, path="/")


def _read_user_id_from_cookie(request: Request, settings: Settings) -> str | None:
    raw = request.cookies.get(settings.session_cookie_name)
    if not raw:
        return None
    try:
        value = _signer(settings).unsign(raw, max_age=settings.session_max_age_seconds)
    except (BadSignature, SignatureExpired):
        return None
    return value.decode("utf-8")


_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    user_id = _read_user_id_from_cookie(request, settings)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Não autenticado.")

    # CSRF: para qualquer método que muda estado, exigir o token no header igual ao do cookie.
    if request.method not in _SAFE_METHODS:
        cookie_token = request.cookies.get(settings.csrf_cookie_name)
        header_token = request.headers.get(settings.csrf_header_name)
        if not cookie_token or not header_token or not secrets.compare_digest(
            cookie_token, header_token
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF token inválido.")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão inválida.")
    return user


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


__all__: list[Any] = [
    "hash_password",
    "verify_password",
    "issue_session",
    "clear_session",
    "get_current_user",
    "now_utc",
]

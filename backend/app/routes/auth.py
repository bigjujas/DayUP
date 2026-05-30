from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.models import User
from app.schemas import LoginIn, RegisterIn, UserOut
from app.security import (
    clear_session,
    get_current_user,
    hash_password,
    issue_session,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterIn,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    user = User(
        email=payload.email.lower(),
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email já cadastrado.") from None
    db.refresh(user)
    issue_session(response, user, settings)
    return user


@router.post("/login", response_model=UserOut)
def login(
    payload: LoginIn,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    user = db.execute(
        select(User).where(User.email == payload.email.lower())
    ).scalar_one_or_none()
    if user is None or not verify_password(user.password_hash, payload.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas.")
    issue_session(response, user, settings)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    _user: User = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> None:
    clear_session(response, settings)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user

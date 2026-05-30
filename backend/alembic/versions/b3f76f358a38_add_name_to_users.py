"""add name to users

Revision ID: b3f76f358a38
Revises: 09e3e37205cc
Create Date: 2026-05-29 23:57:40.747605

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b3f76f358a38'
down_revision: Union[str, None] = '09e3e37205cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Adiciona NULLABLE primeiro pra não estourar com linhas existentes
    op.add_column('users', sa.Column('name', sa.String(length=30), nullable=True))
    # 2. Backfill: usa a parte antes do @ do email, limitada a 30 chars
    op.execute(
        "UPDATE users SET name = left(split_part(email, '@', 1), 30) WHERE name IS NULL"
    )
    # 3. Promove a NOT NULL
    op.alter_column('users', 'name', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'name')

"""add mood/note/finalized to day_logs and done_at to goal_entries

Revision ID: c1a2d4e5f6a7
Revises: b3f76f358a38
Create Date: 2026-06-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c1a2d4e5f6a7'
down_revision: Union[str, None] = 'b3f76f358a38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('day_logs', sa.Column('mood', sa.String(length=8), nullable=True))
    op.add_column('day_logs', sa.Column('note', sa.Text(), nullable=True))
    # server_default garante que linhas existentes recebam False sem estourar NOT NULL.
    op.add_column(
        'day_logs',
        sa.Column('finalized', sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column('goal_entries', sa.Column('done_at', sa.Time(), nullable=True))
    # Remove o server_default: a partir de agora o default vem do app (model default=False).
    op.alter_column('day_logs', 'finalized', server_default=None)


def downgrade() -> None:
    op.drop_column('goal_entries', 'done_at')
    op.drop_column('day_logs', 'finalized')
    op.drop_column('day_logs', 'note')
    op.drop_column('day_logs', 'mood')

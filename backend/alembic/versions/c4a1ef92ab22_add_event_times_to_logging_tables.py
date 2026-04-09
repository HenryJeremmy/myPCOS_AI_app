"""add event times to logging tables

Revision ID: c4a1ef92ab22
Revises: b2d0d7d4f110
Create Date: 2026-04-09 01:45:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c4a1ef92ab22"
down_revision: Union[str, Sequence[str], None] = "b2d0d7d4f110"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def upgrade() -> None:
    if not _has_column("mealentry", "meal_time"):
        op.add_column("mealentry", sa.Column("meal_time", sa.Time(), nullable=True))

    if not _has_column("symptomentry", "symptom_time"):
        op.add_column("symptomentry", sa.Column("symptom_time", sa.Time(), nullable=True))

    if not _has_column("lifestyleentry", "lifestyle_time"):
        op.add_column("lifestyleentry", sa.Column("lifestyle_time", sa.Time(), nullable=True))


def downgrade() -> None:
    if _has_column("lifestyleentry", "lifestyle_time"):
        op.drop_column("lifestyleentry", "lifestyle_time")

    if _has_column("symptomentry", "symptom_time"):
        op.drop_column("symptomentry", "symptom_time")

    if _has_column("mealentry", "meal_time"):
        op.drop_column("mealentry", "meal_time")

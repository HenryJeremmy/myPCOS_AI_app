"""add metabolic fields to meal entry

Revision ID: b2d0d7d4f110
Revises: d09845dfdc41
Create Date: 2026-04-08 23:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b2d0d7d4f110"
down_revision: Union[str, Sequence[str], None] = "d09845dfdc41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def upgrade() -> None:
    if not _has_column("mealentry", "glycaemic_band"):
        op.add_column("mealentry", sa.Column("glycaemic_band", sa.String(length=20), nullable=True))

    if not _has_column("mealentry", "metabolic_summary"):
        op.add_column("mealentry", sa.Column("metabolic_summary", sa.Text(), nullable=True))


def downgrade() -> None:
    if _has_column("mealentry", "metabolic_summary"):
        op.drop_column("mealentry", "metabolic_summary")

    if _has_column("mealentry", "glycaemic_band"):
        op.drop_column("mealentry", "glycaemic_band")

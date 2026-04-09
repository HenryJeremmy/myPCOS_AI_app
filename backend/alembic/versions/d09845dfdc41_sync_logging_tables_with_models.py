"""sync logging tables with models

Revision ID: d09845dfdc41
Revises:
Create Date: 2026-04-02 01:52:01.036189
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = "d09845dfdc41"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def _has_index(table_name: str, index_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(idx["name"] == index_name for idx in inspector.get_indexes(table_name))


def upgrade() -> None:
    if not _has_column("lifestyleentry", "created_at"):
        op.add_column("lifestyleentry", sa.Column("created_at", sa.DateTime(), nullable=True))

    if _has_column("lifestyleentry", "logged_at"):
        op.execute("UPDATE lifestyleentry SET created_at = logged_at WHERE created_at IS NULL")

    op.alter_column(
        "lifestyleentry",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=False,
    )

    op.alter_column(
        "lifestyleentry",
        "sleep_hours",
        existing_type=mysql.FLOAT(),
        nullable=True,
    )
    op.alter_column(
        "lifestyleentry",
        "exercise_minutes",
        existing_type=mysql.INTEGER(),
        nullable=True,
    )
    op.alter_column(
        "lifestyleentry",
        "water_litres",
        existing_type=mysql.FLOAT(),
        nullable=True,
    )
    op.alter_column(
        "lifestyleentry",
        "stress_level",
        existing_type=mysql.INTEGER(),
        type_=sa.String(length=20),
        nullable=True,
    )
    op.alter_column(
        "lifestyleentry",
        "mood",
        existing_type=mysql.VARCHAR(length=100),
        type_=sa.String(length=50),
        nullable=True,
    )

    if not _has_index("lifestyleentry", "ix_lifestyleentry_created_at"):
        op.create_index(
            op.f("ix_lifestyleentry_created_at"),
            "lifestyleentry",
            ["created_at"],
            unique=False,
        )

    if _has_column("lifestyleentry", "logged_at"):
        op.drop_column("lifestyleentry", "logged_at")

    if not _has_column("mealentry", "image_url"):
        op.add_column("mealentry", sa.Column("image_url", sa.String(length=255), nullable=True))

    if not _has_column("mealentry", "created_at"):
        op.add_column("mealentry", sa.Column("created_at", sa.DateTime(), nullable=True))

    if _has_column("mealentry", "logged_at"):
        op.execute("UPDATE mealentry SET created_at = logged_at WHERE created_at IS NULL")

    op.alter_column(
        "mealentry",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=False,
    )

    if not _has_index("mealentry", "ix_mealentry_created_at"):
        op.create_index(
            op.f("ix_mealentry_created_at"),
            "mealentry",
            ["created_at"],
            unique=False,
        )

    if _has_column("mealentry", "logged_at"):
        op.drop_column("mealentry", "logged_at")

    if not _has_column("symptomentry", "mood_change"):
        op.add_column("symptomentry", sa.Column("mood_change", sa.Boolean(), nullable=True))

    if _has_column("symptomentry", "mood_changes"):
        op.execute("UPDATE symptomentry SET mood_change = mood_changes WHERE mood_change IS NULL")

    if not _has_column("symptomentry", "created_at"):
        op.add_column("symptomentry", sa.Column("created_at", sa.DateTime(), nullable=True))

    if _has_column("symptomentry", "logged_at"):
        op.execute("UPDATE symptomentry SET created_at = logged_at WHERE created_at IS NULL")

    op.alter_column(
        "symptomentry",
        "mood_change",
        existing_type=sa.Boolean(),
        nullable=False,
    )
    op.alter_column(
        "symptomentry",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=False,
    )

    op.alter_column(
        "symptomentry",
        "fatigue",
        existing_type=mysql.INTEGER(),
        type_=sa.Boolean(),
        existing_nullable=False,
    )
    op.alter_column(
        "symptomentry",
        "cravings",
        existing_type=mysql.INTEGER(),
        type_=sa.Boolean(),
        existing_nullable=False,
    )
    op.alter_column(
        "symptomentry",
        "bloating",
        existing_type=mysql.INTEGER(),
        type_=sa.Boolean(),
        existing_nullable=False,
    )

    if not _has_index("symptomentry", "ix_symptomentry_created_at"):
        op.create_index(
            op.f("ix_symptomentry_created_at"),
            "symptomentry",
            ["created_at"],
            unique=False,
        )

    if _has_column("symptomentry", "logged_at"):
        op.drop_column("symptomentry", "logged_at")

    if _has_column("symptomentry", "mood_changes"):
        op.drop_column("symptomentry", "mood_changes")


def downgrade() -> None:
    if not _has_column("symptomentry", "mood_changes"):
        op.add_column(
            "symptomentry",
            sa.Column("mood_changes", mysql.INTEGER(), autoincrement=False, nullable=False),
        )
    if not _has_column("symptomentry", "logged_at"):
        op.add_column("symptomentry", sa.Column("logged_at", mysql.DATETIME(), nullable=False))
    if _has_index("symptomentry", "ix_symptomentry_created_at"):
        op.drop_index(op.f("ix_symptomentry_created_at"), table_name="symptomentry")
    if _has_column("symptomentry", "created_at"):
        op.drop_column("symptomentry", "created_at")
    if _has_column("symptomentry", "mood_change"):
        op.drop_column("symptomentry", "mood_change")

    if not _has_column("mealentry", "logged_at"):
        op.add_column("mealentry", sa.Column("logged_at", mysql.DATETIME(), nullable=False))
    if _has_index("mealentry", "ix_mealentry_created_at"):
        op.drop_index(op.f("ix_mealentry_created_at"), table_name="mealentry")
    if _has_column("mealentry", "created_at"):
        op.drop_column("mealentry", "created_at")
    if _has_column("mealentry", "image_url"):
        op.drop_column("mealentry", "image_url")

    if not _has_column("lifestyleentry", "logged_at"):
        op.add_column("lifestyleentry", sa.Column("logged_at", mysql.DATETIME(), nullable=False))
    if _has_index("lifestyleentry", "ix_lifestyleentry_created_at"):
        op.drop_index(op.f("ix_lifestyleentry_created_at"), table_name="lifestyleentry")
    if _has_column("lifestyleentry", "created_at"):
        op.drop_column("lifestyleentry", "created_at")

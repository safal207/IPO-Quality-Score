"""Create the IPO reports table.

Revision ID: 20260721_0001
Revises: None
Create Date: 2026-07-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260721_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ipo_reports",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.String(length=160), nullable=False),
        sa.Column("report_version", sa.String(length=32), nullable=False),
        sa.Column("methodology_version", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("issuer_name", sa.String(length=240), nullable=False),
        sa.Column("ticker", sa.String(length=32), nullable=True),
        sa.Column("exchange", sa.String(length=160), nullable=False),
        sa.Column("filing_url", sa.Text(), nullable=False),
        sa.Column("filing_published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("normalized_score", sa.Float(), nullable=False),
        sa.Column("coverage_percent", sa.Float(), nullable=False),
        sa.Column("overall_confidence", sa.String(length=16), nullable=False),
        sa.Column("source_hash", sa.String(length=64), nullable=False),
        sa.Column("report_document", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("report_id", name="uq_ipo_reports_report_id"),
    )
    op.create_index("ix_ipo_reports_report_id", "ipo_reports", ["report_id"])
    op.create_index("ix_ipo_reports_methodology_version", "ipo_reports", ["methodology_version"])
    op.create_index("ix_ipo_reports_status", "ipo_reports", ["status"])
    op.create_index("ix_ipo_reports_issuer_name", "ipo_reports", ["issuer_name"])
    op.create_index("ix_ipo_reports_ticker", "ipo_reports", ["ticker"])
    op.create_index("ix_ipo_reports_filing_published_at", "ipo_reports", ["filing_published_at"])
    op.create_index("ix_ipo_reports_normalized_score", "ipo_reports", ["normalized_score"])
    op.create_index("ix_ipo_reports_overall_confidence", "ipo_reports", ["overall_confidence"])
    op.create_index("ix_ipo_reports_source_hash", "ipo_reports", ["source_hash"])
    op.create_index(
        "ix_reports_ticker_filing",
        "ipo_reports",
        ["ticker", "filing_published_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_reports_ticker_filing", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_source_hash", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_overall_confidence", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_normalized_score", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_filing_published_at", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_ticker", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_issuer_name", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_status", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_methodology_version", table_name="ipo_reports")
    op.drop_index("ix_ipo_reports_report_id", table_name="ipo_reports")
    op.drop_table("ipo_reports")

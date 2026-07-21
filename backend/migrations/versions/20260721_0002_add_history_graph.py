"""Add issuer, filing, version, source, and report history.

Revision ID: 20260721_0002
Revises: 20260721_0001
Create Date: 2026-07-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260721_0002"
down_revision: Union[str, None] = "20260721_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "issuers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("legal_name", sa.String(length=240), nullable=False),
        sa.Column("brand_name", sa.String(length=240), nullable=True),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("industry", sa.Text(), nullable=False),
        sa.Column("website", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "legal_name",
            "country",
            name="uq_issuers_legal_name_country",
        ),
    )
    op.create_index("ix_issuers_legal_name", "issuers", ["legal_name"])
    op.create_index("ix_issuers_country", "issuers", ["country"])

    op.create_table(
        "filings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("issuer_id", sa.Integer(), nullable=False),
        sa.Column("filing_key", sa.String(length=64), nullable=False),
        sa.Column("filing_type", sa.String(length=64), nullable=False),
        sa.Column("exchange", sa.String(length=160), nullable=False),
        sa.Column("ticker", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["issuer_id"],
            ["issuers.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("filing_key"),
    )
    op.create_index("ix_filings_issuer_id", "filings", ["issuer_id"])
    op.create_index("ix_filings_filing_key", "filings", ["filing_key"], unique=True)
    op.create_index("ix_filings_filing_type", "filings", ["filing_type"])
    op.create_index("ix_filings_ticker", "filings", ["ticker"])

    op.create_table(
        "filing_versions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filing_id", sa.Integer(), nullable=False),
        sa.Column("version_label", sa.Text(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_accessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("source_hash", sa.String(length=64), nullable=False),
        sa.Column("is_current", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("supersedes_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["filing_id"],
            ["filings.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["supersedes_id"],
            ["filing_versions.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "filing_id",
            "source_hash",
            name="uq_filing_versions_filing_source_hash",
        ),
    )
    op.create_index("ix_filing_versions_filing_id", "filing_versions", ["filing_id"])
    op.create_index("ix_filing_versions_published_at", "filing_versions", ["published_at"])
    op.create_index("ix_filing_versions_source_hash", "filing_versions", ["source_hash"])
    op.create_index("ix_filing_versions_is_current", "filing_versions", ["is_current"])
    op.create_index("ix_filing_versions_supersedes_id", "filing_versions", ["supersedes_id"])
    op.create_index(
        "ix_filing_versions_filing_current",
        "filing_versions",
        ["filing_id", "is_current"],
    )

    op.create_table(
        "source_snapshots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filing_version_id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(length=64), nullable=False),
        sa.Column("source_title", sa.Text(), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("source_version", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("snapshot_document", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["filing_version_id"],
            ["filing_versions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "filing_version_id",
            "content_hash",
            name="uq_source_snapshots_version_hash",
        ),
    )
    op.create_index(
        "ix_source_snapshots_filing_version_id",
        "source_snapshots",
        ["filing_version_id"],
    )
    op.create_index("ix_source_snapshots_source_type", "source_snapshots", ["source_type"])
    op.create_index("ix_source_snapshots_content_hash", "source_snapshots", ["content_hash"])

    with op.batch_alter_table("ipo_reports") as batch_op:
        batch_op.add_column(sa.Column("filing_version_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("supersedes_report_id", sa.String(length=160), nullable=True))
        batch_op.add_column(
            sa.Column(
                "is_latest",
                sa.Boolean(),
                server_default=sa.true(),
                nullable=False,
            )
        )
        batch_op.create_foreign_key(
            "fk_ipo_reports_filing_version_id",
            "filing_versions",
            ["filing_version_id"],
            ["id"],
            ondelete="RESTRICT",
        )
        batch_op.create_index("ix_ipo_reports_filing_version_id", ["filing_version_id"])
        batch_op.create_index("ix_ipo_reports_supersedes_report_id", ["supersedes_report_id"])
        batch_op.create_index("ix_ipo_reports_is_latest", ["is_latest"])
        batch_op.create_index(
            "ix_reports_filing_latest",
            ["filing_version_id", "is_latest"],
        )

    op.create_table(
        "report_source_snapshots",
        sa.Column("report_record_id", sa.Integer(), nullable=False),
        sa.Column("source_snapshot_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["report_record_id"],
            ["ipo_reports.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["source_snapshot_id"],
            ["source_snapshots.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("report_record_id", "source_snapshot_id"),
    )


def downgrade() -> None:
    op.drop_table("report_source_snapshots")

    with op.batch_alter_table("ipo_reports") as batch_op:
        batch_op.drop_index("ix_reports_filing_latest")
        batch_op.drop_index("ix_ipo_reports_is_latest")
        batch_op.drop_index("ix_ipo_reports_supersedes_report_id")
        batch_op.drop_index("ix_ipo_reports_filing_version_id")
        batch_op.drop_constraint(
            "fk_ipo_reports_filing_version_id",
            type_="foreignkey",
        )
        batch_op.drop_column("is_latest")
        batch_op.drop_column("supersedes_report_id")
        batch_op.drop_column("filing_version_id")

    op.drop_index("ix_source_snapshots_content_hash", table_name="source_snapshots")
    op.drop_index("ix_source_snapshots_source_type", table_name="source_snapshots")
    op.drop_index("ix_source_snapshots_filing_version_id", table_name="source_snapshots")
    op.drop_table("source_snapshots")

    op.drop_index("ix_filing_versions_filing_current", table_name="filing_versions")
    op.drop_index("ix_filing_versions_supersedes_id", table_name="filing_versions")
    op.drop_index("ix_filing_versions_is_current", table_name="filing_versions")
    op.drop_index("ix_filing_versions_source_hash", table_name="filing_versions")
    op.drop_index("ix_filing_versions_published_at", table_name="filing_versions")
    op.drop_index("ix_filing_versions_filing_id", table_name="filing_versions")
    op.drop_table("filing_versions")

    op.drop_index("ix_filings_ticker", table_name="filings")
    op.drop_index("ix_filings_filing_type", table_name="filings")
    op.drop_index("ix_filings_filing_key", table_name="filings")
    op.drop_index("ix_filings_issuer_id", table_name="filings")
    op.drop_table("filings")

    op.drop_index("ix_issuers_country", table_name="issuers")
    op.drop_index("ix_issuers_legal_name", table_name="issuers")
    op.drop_table("issuers")

from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from backend.app.config import PROJECT_ROOT


def alembic_config(database_url: str) -> Config:
    config = Config(str(PROJECT_ROOT / "backend" / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    return config


def test_initial_migration_up_and_down(tmp_path: Path) -> None:
    database_url = f"sqlite:///{tmp_path / 'migration.db'}"
    config = alembic_config(database_url)

    command.upgrade(config, "head")
    engine = create_engine(database_url)
    try:
        inspector = inspect(engine)
        assert "ipo_reports" in inspector.get_table_names()
        indexes = {item["name"] for item in inspector.get_indexes("ipo_reports")}
        assert "ix_reports_ticker_filing" in indexes
        assert "ix_ipo_reports_normalized_score" in indexes
    finally:
        engine.dispose()

    command.downgrade(config, "base")
    engine = create_engine(database_url)
    try:
        assert "ipo_reports" not in inspect(engine).get_table_names()
    finally:
        engine.dispose()

from __future__ import annotations

from pathlib import Path

from backend.app.config import (
    DEFAULT_APP_NAME,
    DEFAULT_APP_VERSION,
    DEFAULT_DATABASE_URL,
    DEFAULT_REPORTS_ROOT,
    DEFAULT_SCHEMA_PATH,
    Settings,
)


def test_from_env_uses_concrete_defaults(monkeypatch) -> None:
    for name in (
        "IQS_APP_NAME",
        "IQS_APP_VERSION",
        "IQS_DATABASE_URL",
        "IQS_REPORTS_ROOT",
        "IQS_SCHEMA_PATH",
        "IQS_AUTO_CREATE_SCHEMA",
        "IQS_IMPORT_REPORTS_ON_STARTUP",
        "IQS_CORS_ORIGINS",
    ):
        monkeypatch.delenv(name, raising=False)

    settings = Settings.from_env()

    assert settings.app_name == DEFAULT_APP_NAME
    assert settings.app_version == DEFAULT_APP_VERSION
    assert settings.database_url == DEFAULT_DATABASE_URL
    assert settings.reports_root == DEFAULT_REPORTS_ROOT.resolve()
    assert settings.schema_path == DEFAULT_SCHEMA_PATH.resolve()
    assert settings.auto_create_schema is False
    assert settings.import_reports_on_startup is True
    assert all(isinstance(origin, str) for origin in settings.cors_origins)
    assert isinstance(settings.reports_root, Path)

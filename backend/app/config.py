from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_APP_NAME = "IPO Quality Score API"
DEFAULT_APP_VERSION = "0.3.0"
DEFAULT_DATABASE_URL = "sqlite:///./ipo_quality_score.db"
DEFAULT_REPORTS_ROOT = PROJECT_ROOT / "reports"
DEFAULT_SCHEMA_PATH = PROJECT_ROOT / "schema" / "ipo-report.schema.json"
DEFAULT_CORS_ORIGINS = (
    "http://localhost:3000",
    "http://localhost:5173",
)


def _as_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = DEFAULT_APP_NAME
    app_version: str = DEFAULT_APP_VERSION
    database_url: str = DEFAULT_DATABASE_URL
    reports_root: Path = DEFAULT_REPORTS_ROOT
    schema_path: Path = DEFAULT_SCHEMA_PATH
    auto_create_schema: bool = False
    import_reports_on_startup: bool = True
    cors_origins: tuple[str, ...] = DEFAULT_CORS_ORIGINS

    @classmethod
    def from_env(cls) -> "Settings":
        origins = tuple(
            item.strip()
            for item in os.getenv(
                "IQS_CORS_ORIGINS",
                ",".join(DEFAULT_CORS_ORIGINS),
            ).split(",")
            if item.strip()
        )
        return cls(
            app_name=os.getenv("IQS_APP_NAME", DEFAULT_APP_NAME),
            app_version=os.getenv("IQS_APP_VERSION", DEFAULT_APP_VERSION),
            database_url=os.getenv("IQS_DATABASE_URL", DEFAULT_DATABASE_URL),
            reports_root=Path(
                os.getenv("IQS_REPORTS_ROOT", str(DEFAULT_REPORTS_ROOT))
            ).resolve(),
            schema_path=Path(
                os.getenv("IQS_SCHEMA_PATH", str(DEFAULT_SCHEMA_PATH))
            ).resolve(),
            auto_create_schema=_as_bool(
                os.getenv("IQS_AUTO_CREATE_SCHEMA"), default=False
            ),
            import_reports_on_startup=_as_bool(
                os.getenv("IQS_IMPORT_REPORTS_ON_STARTUP"), default=True
            ),
            cors_origins=origins,
        )

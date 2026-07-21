from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _as_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = "IPO Quality Score API"
    app_version: str = "0.1.0"
    database_url: str = "sqlite:///./ipo_quality_score.db"
    reports_root: Path = PROJECT_ROOT / "reports"
    schema_path: Path = PROJECT_ROOT / "schema" / "ipo-report.schema.json"
    auto_create_schema: bool = True
    import_reports_on_startup: bool = True
    cors_origins: tuple[str, ...] = (
        "http://localhost:3000",
        "http://localhost:5173",
    )

    @classmethod
    def from_env(cls) -> "Settings":
        origins = tuple(
            item.strip()
            for item in os.getenv(
                "IQS_CORS_ORIGINS",
                "http://localhost:3000,http://localhost:5173",
            ).split(",")
            if item.strip()
        )
        return cls(
            app_name=os.getenv("IQS_APP_NAME", cls.app_name),
            app_version=os.getenv("IQS_APP_VERSION", cls.app_version),
            database_url=os.getenv("IQS_DATABASE_URL", cls.database_url),
            reports_root=Path(
                os.getenv("IQS_REPORTS_ROOT", str(PROJECT_ROOT / "reports"))
            ).resolve(),
            schema_path=Path(
                os.getenv(
                    "IQS_SCHEMA_PATH",
                    str(PROJECT_ROOT / "schema" / "ipo-report.schema.json"),
                )
            ).resolve(),
            auto_create_schema=_as_bool(
                os.getenv("IQS_AUTO_CREATE_SCHEMA"), default=True
            ),
            import_reports_on_startup=_as_bool(
                os.getenv("IQS_IMPORT_REPORTS_ON_STARTUP"), default=True
            ),
            cors_origins=origins,
        )

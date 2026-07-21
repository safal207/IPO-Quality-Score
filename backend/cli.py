from __future__ import annotations

import argparse
from pathlib import Path

from backend.app.config import Settings
from backend.app.database import Database
from backend.app.services import import_reports


def main() -> int:
    defaults = Settings.from_env()
    parser = argparse.ArgumentParser(description="IPO Quality Score backend utilities")
    parser.add_argument(
        "command",
        choices=["import-reports"],
        help="Utility command to run",
    )
    parser.add_argument("--database-url", default=defaults.database_url)
    parser.add_argument("--reports-root", type=Path, default=defaults.reports_root)
    parser.add_argument("--schema-path", type=Path, default=defaults.schema_path)
    args = parser.parse_args()

    database = Database(args.database_url)
    database.create_schema()
    try:
        with database.session_factory() as session:
            stats = import_reports(
                session,
                args.reports_root.resolve(),
                args.schema_path.resolve(),
            )
        print(
            "import complete "
            f"created={stats.created} updated={stats.updated} "
            f"unchanged={stats.unchanged} total={stats.total}"
        )
        return 0
    finally:
        database.dispose()


if __name__ == "__main__":
    raise SystemExit(main())

# Database migrations

Run all migrations from the repository root:

```bash
alembic -c backend/alembic.ini upgrade head
```

Create reviewed revisions with:

```bash
alembic -c backend/alembic.ini revision --autogenerate -m "describe change"
```

Migration files are versioned database contracts. Review generated operations, indexes, nullability, data movement, and downgrade behavior before commit.

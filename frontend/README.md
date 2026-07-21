# IPO Quality Score Frontend v0.1

Read-only React dashboard for the evidence-first IPO Quality Score backend.

## Stack

- TypeScript 7.0 native `tsc`
- React 19.2
- Vite 8
- Node.js 22.12+
- plain CSS with responsive and reduced-motion support

TypeScript 7 is used directly for CLI type-checking. The frontend deliberately avoids tools that require the TypeScript compiler API because TypeScript 7.0 does not expose a stable programmatic API yet.

## Features

- IPO report list from `GET /api/v1/reports`;
- local issuer/ticker search;
- server-side minimum-score filter;
- report detail from `GET /api/v1/reports/{report_id}`;
- provenance from `GET /api/v1/reports/{report_id}/provenance`;
- score, evidence coverage, confidence, dimensions, risks, strengths, unknowns, and evidence;
- current/superseded filing state;
- honest loading, empty, and backend-error states;
- no embedded mock research data.

## Local run with the backend

From the repository root, start PostgreSQL and FastAPI:

```bash
docker compose up --build
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api` and `/health` to `http://127.0.0.1:8000` by default.

## Environment

Copy `.env.example` to `.env.local` when a custom endpoint is required.

```env
VITE_API_BASE_URL=
VITE_BACKEND_PROXY_TARGET=http://127.0.0.1:8000
```

For a deployed static frontend, set `VITE_API_BASE_URL` to the public backend origin. The value is compiled into the frontend bundle, so it must not contain secrets.

## Validation

```bash
npm run typecheck
npm run build
```

`npm run build` always runs the TypeScript 7 typecheck before Vite creates the production bundle.

## Current boundary

Included:

- read-only research dashboard;
- typed backend contracts;
- filing provenance visibility;
- current versus superseded state;
- responsive desktop and mobile layouts.

Deferred:

- routing and shareable issuer/report URLs;
- comparison charts;
- filing-history timeline UI;
- authentication and reviewer tools;
- watchlists, alerts, subscriptions, and billing;
- analytics and accessibility audit in a real browser matrix.

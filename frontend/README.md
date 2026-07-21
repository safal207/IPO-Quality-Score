# IPO Quality Score Frontend v0.1

Read-only React dashboard for the evidence-first IPO Quality Score backend.

## Stack

- TypeScript 7.0 native `tsc`
- React 19.2
- Vite 8
- Node.js 22.12+
- Vitest and Testing Library
- Playwright Chromium smoke testing
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
- honest and separate list/detail loading and error states;
- selection synchronized with the currently visible filtered reports;
- no embedded mock research data in the application bundle.

## Runtime contract boundary

TypeScript checks the code at build time, but HTTP responses are untrusted runtime data. The API client therefore validates list, detail, provenance, dates, numeric fields, arrays, and required properties before React receives them.

Evidence and filing links are accepted only when they use absolute `http` or `https` URLs. Malformed payloads are surfaced as explicit contract errors rather than failing later inside the UI.

## Local run with the backend

From the repository root, start PostgreSQL and FastAPI:

```bash
docker compose up --build
```

In another terminal:

```bash
cd frontend
npm ci
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

Install exactly the committed dependency graph:

```bash
npm ci
```

Run runtime-contract and component tests:

```bash
npm test
```

Run strict TypeScript checks and the production build:

```bash
npm run build
```

Install Chromium once and run the browser smoke flow:

```bash
npx playwright install chromium
npm run test:e2e
```

The GitHub Actions workflow performs all of these checks with read-only repository permissions and checkout credential persistence disabled.

## Test coverage

The current suite proves:

- valid report list, detail, and provenance responses are accepted;
- malformed numeric fields are rejected before rendering;
- unsafe non-HTTP evidence links are rejected;
- detail/provenance failures do not mislabel a healthy report list;
- search results and selected detail stay synchronized;
- Chromium can load the dashboard, switch reports through search, and expose audited evidence links.

## Current boundary

Included:

- read-only research dashboard;
- typed and runtime-validated backend contracts;
- filing provenance visibility;
- current versus superseded state;
- responsive desktop and mobile layouts;
- component, contract, and Chromium smoke tests.

Deferred:

- routing and shareable issuer/report URLs;
- comparison charts;
- filing-history timeline UI;
- authentication and reviewer tools;
- watchlists, alerts, subscriptions, and billing;
- broader cross-browser and assistive-technology testing.

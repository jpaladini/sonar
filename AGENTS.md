# AGENTS.md — Sonar runbook

Operational guide for building, testing, deploying, and verifying Sonar.

## What this is

A Databricks App: React SPA (Vite + TypeScript + Tailwind) + FastAPI BFF in a
single process. Frontend source lives in `frontend/`; the **built output is
committed to `src/static/`** so deploys need no Node toolchain. FastAPI serves
`/api/*` and the static SPA with an index.html fallback.

The app recreates the high-fidelity design in `design/` (`README.md` is the
spec; `Sonar.dc.html` is the interactive prototype; `support.js` is prototype
runtime only — never port it).

## Dev environment facts (verified)

- Workspace: `https://dbc-49fa4800-f5f0.cloud.databricks.com` (Free Edition)
- Catalog: `workspace`; SQL warehouse id: `93c5f9f3549e0e4a`
- App limit ≤3; `ado-companion` uses one slot, `sonar` is the second
- The gold pipeline (`sonar.gold.calls_labeled`) does **not** exist in dev —
  the BFF probes Delta once at startup and serves canned fixtures when
  unavailable (`/api/health` → `"provider": "canned"`). This is expected.

## Build

```bash
# Frontend (regenerates src/static — commit the result)
cd frontend && npm ci && npm run build

# Backend deps (local dev + tests)
pip install -r requirements-dev.txt
```

## Run locally

```bash
cd src && python serve.py          # binds DATABRICKS_APP_PORT, default 8000
curl localhost:8000/api/health
```

For frontend iteration: `cd frontend && npm run dev` (Vite proxies `/api` to
`localhost:8000`).

## Test

```bash
python -m pytest tests/ -q         # 27 tests; every BFF endpoint covered
```

## Verify UI against the design

```bash
python -m http.server 8100 --directory design &     # prototype
(cd src && python serve.py) &                       # app
NODE_PATH=$(npm root -g) CDN_DIR=<offline-cdn-dir> node verify/screenshot.mjs out/
```

`CDN_DIR` holds offline copies of the prototype's CDN deps (react.js,
react-dom.js, babel.js from unpkg; fonts.css + `fonts/*.woff2` from Google
Fonts) — needed in sandboxes where Chromium can't reach the proxy. Compare
`proto-*` vs `app-*` screenshots in both themes.

## Deploy (DAB via ADO — the only supported path)

1. Push a branch to GitHub → `.github/workflows/mirror-to-ado.yml` force-pushes
   it to ADO (`jpaladini85/home/_git/sonar`).
2. Create an ADO PR into `dev`; validation pipeline
   (`azure-pipelines-validate.yml`, registered as a Build Validation policy)
   runs npm build + pytest + `bundle validate`.
3. Merge → `azure-pipelines.yml` runs: npm build → `databricks bundle validate
   -t dev` → `databricks bundle deploy -t dev` → `databricks bundle run sonar`.
4. Poll the pipeline **by build id** (never `$top=1`).

Manual validate (no deploy):

```bash
DATABRICKS_HOST=https://dbc-49fa4800-f5f0.cloud.databricks.com \
DATABRICKS_TOKEN=<pat> databricks bundle validate -t dev
```

## Verify a deployment

```bash
# App status + URL
curl -s -H "Authorization: Bearer $PAT" \
  https://dbc-49fa4800-f5f0.cloud.databricks.com/api/2.0/apps/sonar | jq '.app_status, .url'

# Health through the app (requires browser auth; from CI use the app URL + OAuth)
curl -s <app-url>/api/health
```

Then run Playwright against the live URL for a visual check.

## Architecture seams (for future work)

- `src/app/data.py` — `DataProvider` protocol; `CannedData` (fixtures) vs
  `DeltaData` (statement-execution over `{SONAR_CATALOG}.{SONAR_SCHEMA}`,
  env-configured, defaults `workspace.sonar_gold`). Probe result cached per
  process; `reset_provider()` for tests.
- `src/app/chat.py` — v1 deterministic keyword router. v2 replaces this with a
  serving-endpoint call (use `databricks-llama-4-maverick` on Free Edition;
  Claude endpoints are rate-limited to 0 there) emitting the same block schema.
- `src/app/store.py` — per-user in-memory conversations/saved items behind a
  `StateStore` seam for a later Delta app-state table.
- Block schema (the API contract the SPA renders):
  `{isText|isBars|isTable|isAgents|isChips, …}` with semantic colors
  (`good|warn|bad|text|muted|faint`) — the BFF never emits CSS.

## Rules

- Never commit tokens. PATs are passed inline as env vars per command.
- Sandbox sessions cannot write secrets, run grants, or merge PRs — hand the
  user ready-to-paste steps for those.
- Commit style: imperative subject + why-body.

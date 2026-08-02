# NEXT_SESSION.md — handoff

## Where things stand (v1 complete, pending merge + deploy)

- **Repo**: `dev` is trunk (initial commit only until the first PR merges).
  All work is on `claude/sonar-databricks-app-e91pa9`.
- **Backend**: FastAPI BFF in `src/` — chat (keyword-routed canned blocks),
  conversations CRUD, transcripts, saved items, panels, pipeline health,
  `/api/health`. 27 pytest tests green (`python -m pytest tests/ -q`).
- **Frontend**: pixel-perfect SPA in `frontend/`, built output committed to
  `src/static/`. Verified against the prototype with Playwright side-by-side
  screenshots in both themes (see AGENTS.md → Verify UI).
- **Bundle**: `databricks.yml` validates against the dev workspace; app
  resource name stays `sonar` in dev mode (checked via `bundle summary`).
- **CI**: mirror-to-ADO workflow + deploy/validate Azure pipelines committed.
  They are inert until the one-time setup (GitHub secrets, ADO repo, pipeline
  registration) is done — see the PR description / session summary for the
  exact steps and values.

## What's honest about the data plane

`sonar.gold.calls_labeled` does not exist in the dev workspace. The app runs
on `CannedData` (fixtures identical to the design seed) and reports
`"provider": "canned", "delta": {"available": false}` in `/api/health`.
`DeltaData` is implemented (statement-execution against warehouse
`8d0b8b0c7401cc20`, env-configured catalog/schema, default
`workspace.sonar_gold`) and will activate automatically once the probe query
succeeds. Conversations/saved items are per-user **in-memory** (reset on app
restart) behind the `StateStore` seam.

## Next up (in order)

1. **Merge + first deploy**: user completes one-time setup, merges the ADO PR
   into `dev`, pipeline deploys. Verify: apps API status `RUNNING`, open app
   URL, `/api/health`, Playwright against live URL.
2. **v2 chat wiring (separate PR)**: replace `src/app/chat.py` routing with a
   Databricks serving-endpoint call — endpoint name from env
   (`SONAR_LLM_ENDPOINT`, use `databricks-llama-4-maverick` on this Free
   Edition workspace; Claude endpoints are rate-limited to 0 there).
   Tool-calling over `DataProvider` methods; structured blocks come from tool
   results mirroring the existing block schema; stream tokens to the UI
   (swap the client-side simulation for real SSE). MLflow tracing optional
   and never fatal.
3. **Delta app-state** (optional): persist conversations/saved items per user
   in a Delta table; implement against the `StateStore` interface.
4. **Fonts**: currently Google Fonts CDN; self-host into `src/static/fonts`
   if the workspace network is restricted (note already in
   `frontend/index.html`).

## Gotchas learned this session

- FastAPI: 204 routes must return `Response`, and union return annotations
  need `response_model=None`.
- Tailwind preflight `line-height: 1.5` breaks fidelity vs. the prototype's
  browser-default line boxes — reset in `frontend/src/index.css`; don't remove.
- Playwright in this sandbox: Chromium ignores the proxy bypass list, so the
  verify script fulfills CDN/font requests from local copies (`CDN_DIR`).
- `verify/screenshot.mjs` needs `NODE_PATH=$(npm root -g)` (global playwright
  install, CJS resolution via createRequire).

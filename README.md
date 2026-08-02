# Sonar — Call Center Intelligence

A 3-pane analytics chat app for call center intelligence, deployed as a
Databricks App. Users query a labeled call corpus (drivers, sentiment,
escalation flags, QA rubric checks) conversationally.

- **Frontend**: React SPA (Vite + TypeScript + Tailwind), source in `frontend/`,
  built output committed to `src/static/` (no Node at deploy time).
- **Backend**: FastAPI BFF in `src/`, serves `/api/*` and the static SPA.
- **Deploy**: Databricks Asset Bundle (`databricks.yml`), targets `dev` / `prod`.
- **CI/CD**: GitHub → mirror to Azure DevOps → Azure Pipelines deploys on merge
  to `dev`.

See `AGENTS.md` for the build/deploy/verify runbook and `design/` for the
high-fidelity design reference this app recreates.

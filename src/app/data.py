"""Data layer seam for Sonar.

Two implementations of the same interface:

- ``CannedData``: rich fixtures matching every block type in the design
  prototype. Always available.
- ``DeltaData``: queries ``{catalog}.{schema}`` via a SQL warehouse using the
  Databricks SDK statement-execution API. Selected only when a one-time probe
  against ``calls_labeled`` succeeds.

``get_provider()`` probes Delta once per process and degrades gracefully to
canned data — a missing table must never crash the app. The active provider
and its availability are surfaced in ``/api/health``.
"""

from __future__ import annotations

import logging
import os
import threading
from typing import Any, Protocol

from . import fixtures

logger = logging.getLogger("sonar.data")

CATALOG = os.environ.get("SONAR_CATALOG", "workspace")
SCHEMA = os.environ.get("SONAR_SCHEMA", "sonar_gold")
WAREHOUSE_ID = os.environ.get("SONAR_WAREHOUSE_ID", "")


class DataProvider(Protocol):
    name: str

    def report(self) -> dict[str, Any]: ...
    def charts(self) -> dict[str, Any]: ...
    def transcripts(self) -> dict[str, Any]: ...
    def transcript(self, call_id: str) -> dict[str, Any] | None: ...
    def agents(self) -> dict[str, Any]: ...
    def pipeline_health(self) -> list[dict[str, Any]]: ...
    def labeling_prompts(self) -> list[dict[str, Any]]: ...


class CannedData:
    """Fixture-backed provider — the v1 default."""

    name = "canned"

    def report(self) -> dict[str, Any]:
        return fixtures.deepcopy(fixtures.REPORT)

    def charts(self) -> dict[str, Any]:
        return fixtures.deepcopy(fixtures.CHARTS)

    def transcripts(self) -> dict[str, Any]:
        return fixtures.deepcopy(fixtures.TRANSCRIPTS)

    def transcript(self, call_id: str) -> dict[str, Any] | None:
        for item in fixtures.TRANSCRIPTS["items"]:
            if item["id"] == call_id:
                return fixtures.deepcopy(item)
        return None

    def agents(self) -> dict[str, Any]:
        return fixtures.deepcopy(fixtures.AGENTS_TABLE)

    def pipeline_health(self) -> list[dict[str, Any]]:
        return fixtures.deepcopy(fixtures.PIPELINE_STAGES)

    def labeling_prompts(self) -> list[dict[str, Any]]:
        return fixtures.deepcopy(fixtures.LABELING_PROMPTS)


class DeltaData:
    """SQL-warehouse-backed provider over ``{catalog}.{schema}.calls_labeled``.

    Uses the same WorkspaceClient statement-execution pattern as the other
    apps in this workspace. Read paths that have no gold-table equivalent yet
    (report prose, labeling prompts) fall back to fixtures.
    """

    name = "delta"

    def __init__(self, catalog: str = CATALOG, schema: str = SCHEMA,
                 warehouse_id: str = WAREHOUSE_ID):
        from databricks.sdk import WorkspaceClient

        self.catalog = catalog
        self.schema = schema
        self.warehouse_id = warehouse_id
        self.client = WorkspaceClient()
        self._canned = CannedData()

    # -- plumbing ---------------------------------------------------------

    def _sql(self, statement: str) -> list[list[Any]]:
        resp = self.client.statement_execution.execute_statement(
            statement=statement,
            warehouse_id=self.warehouse_id,
            wait_timeout="30s",
        )
        state = resp.status.state.value if resp.status and resp.status.state else "UNKNOWN"
        if state != "SUCCEEDED":
            raise RuntimeError(f"statement state {state}: {statement[:120]}")
        if resp.result and resp.result.data_array:
            return resp.result.data_array
        return []

    def _table(self, name: str) -> str:
        return f"`{self.catalog}`.`{self.schema}`.`{name}`"

    def probe(self) -> bool:
        try:
            self._sql(f"SELECT 1 FROM {self._table('calls_labeled')} LIMIT 1")
            return True
        except Exception as exc:  # noqa: BLE001 — any failure means unavailable
            logger.info("Delta probe failed, using canned data: %s", exc)
            return False

    # -- reads ------------------------------------------------------------

    def report(self) -> dict[str, Any]:
        return self._canned.report()

    def charts(self) -> dict[str, Any]:
        charts = self._canned.charts()
        try:
            rows = self._sql(
                f"SELECT date_format(call_date, 'EEE') AS day, count(*) AS n "
                f"FROM {self._table('calls_labeled')} "
                f"WHERE call_date >= current_date() - INTERVAL 7 DAYS "
                f"GROUP BY day, dayofweek(call_date) ORDER BY dayofweek(call_date)"
            )
            if rows:
                peak = max(int(r[1]) for r in rows) or 1
                charts["volume"]["items"] = [
                    {"day": r[0], "pct": round(100 * int(r[1]) / peak),
                     "muted": r[0] in ("Sat", "Sun")}
                    for r in rows
                ]
        except Exception as exc:  # noqa: BLE001
            logger.warning("charts query failed, serving canned: %s", exc)
        return charts

    def transcripts(self) -> dict[str, Any]:
        return self._canned.transcripts()

    def transcript(self, call_id: str) -> dict[str, Any] | None:
        try:
            safe_id = call_id.replace("'", "")
            rows = self._sql(
                f"SELECT speaker, is_agent, turn_text "
                f"FROM {self._table('call_transcripts')} "
                f"WHERE call_id = '{safe_id}' ORDER BY turn_index"
            )
            if rows:
                return {
                    "id": call_id,
                    "meta": "", "score": "", "labels": [],
                    "turns": [
                        {"who": r[0], "agent": str(r[1]).lower() == "true", "text": r[2]}
                        for r in rows
                    ],
                }
        except Exception as exc:  # noqa: BLE001
            logger.warning("transcript query failed, serving canned: %s", exc)
        return self._canned.transcript(call_id)

    def agents(self) -> dict[str, Any]:
        table = self._canned.agents()
        try:
            rows = self._sql(
                f"SELECT agent_name, round(avg(sentiment), 1) AS sent, "
                f"count(*) AS calls, "
                f"concat(round(100 * avg(cast(escalated AS int))), '%') AS esc "
                f"FROM {self._table('calls_labeled')} "
                f"WHERE primary_driver = 'cancellation' "
                f"GROUP BY agent_name ORDER BY sent ASC"
            )
            if rows:
                def color(sent: float) -> str:
                    if sent <= 2.0:
                        return "bad"
                    if sent <= 2.3:
                        return "warn"
                    if sent >= 3.4:
                        return "good"
                    return "text"

                table["rows"] = [
                    {"name": r[0], "sent": f"{float(r[1]):.1f}", "calls": int(r[2]),
                     "esc": r[3], "color": color(float(r[1]))}
                    for r in rows
                ]
        except Exception as exc:  # noqa: BLE001
            logger.warning("agents query failed, serving canned: %s", exc)
        return table

    def pipeline_health(self) -> list[dict[str, Any]]:
        return self._canned.pipeline_health()

    def labeling_prompts(self) -> list[dict[str, Any]]:
        return self._canned.labeling_prompts()


_lock = threading.Lock()
_provider: DataProvider | None = None
_delta_available: bool | None = None


def get_provider() -> DataProvider:
    """Return the active provider, probing Delta exactly once per process."""
    global _provider, _delta_available
    with _lock:
        if _provider is not None:
            return _provider
        _delta_available = False
        if WAREHOUSE_ID:
            try:
                delta = DeltaData()
                if delta.probe():
                    _provider = delta
                    _delta_available = True
                    logger.info("Delta provider active: %s.%s", CATALOG, SCHEMA)
                    return _provider
            except Exception as exc:  # noqa: BLE001 — SDK/auth failures degrade too
                logger.info("Delta init failed, using canned data: %s", exc)
        _provider = CannedData()
        return _provider


def delta_available() -> bool:
    if _delta_available is None:
        get_provider()
    return bool(_delta_available)


def reset_provider() -> None:
    """Test hook: clear the cached provider/probe result."""
    global _provider, _delta_available
    with _lock:
        _provider = None
        _delta_available = None

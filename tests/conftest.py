import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from app import data  # noqa: E402
from app import store as store_mod  # noqa: E402
from app.main import app  # noqa: E402
from app.store import StateStore  # noqa: E402


@pytest.fixture()
def client(monkeypatch):
    """TestClient with a fresh in-memory store and a canned-forced data layer."""
    fresh = StateStore()
    monkeypatch.setattr(store_mod, "STORE", fresh)
    import app.main as main_mod

    monkeypatch.setattr(main_mod, "STORE", fresh)
    data.reset_provider()
    monkeypatch.setattr(data, "WAREHOUSE_ID", "")
    yield TestClient(app)
    data.reset_provider()

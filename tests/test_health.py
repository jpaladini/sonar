from app import data


def test_health_reports_canned_when_no_warehouse(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["provider"] == "canned"
    assert body["delta"]["available"] is False
    assert body["delta"]["catalog"]
    assert body["delta"]["schema"]
    assert body["persistence"] == "memory"


def test_provider_degrades_when_delta_init_fails(client, monkeypatch):
    data.reset_provider()
    monkeypatch.setattr(data, "WAREHOUSE_ID", "fake-warehouse")

    class Boom:
        def __init__(self, *a, **k):
            raise RuntimeError("no workspace auth")

    monkeypatch.setattr(data, "DeltaData", Boom)
    provider = data.get_provider()
    assert provider.name == "canned"
    assert data.delta_available() is False


def test_provider_uses_delta_when_probe_succeeds(client, monkeypatch):
    data.reset_provider()
    monkeypatch.setattr(data, "WAREHOUSE_ID", "fake-warehouse")

    class FakeDelta:
        name = "delta"

        def __init__(self, *a, **k):
            pass

        def probe(self):
            return True

    monkeypatch.setattr(data, "DeltaData", FakeDelta)
    provider = data.get_provider()
    assert provider.name == "delta"
    assert data.delta_available() is True


def test_bootstrap_shape(client):
    body = client.get("/api/bootstrap").json()
    assert body["workspace"] == "Acme CX · Production"
    assert body["user"]["initials"] == "JT"
    assert len(body["suggestions"]) == 4
    assert len(body["thinkingLabels"]) == 2

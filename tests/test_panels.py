def test_report_shape(client):
    body = client.get("/api/report").json()
    assert body["title"] == "Weekly Call Driver Report"
    assert body["kicker"].startswith("SONAR-RPT")
    assert len(body["findings"]) == 3
    assert len(body["actions"]) == 3
    assert any(seg["bold"] for seg in body["summary"])


def test_charts_shape(client):
    body = client.get("/api/charts").json()
    assert [i["day"] for i in body["volume"]["items"]] == \
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    assert body["volume"]["items"][5]["muted"] is True
    assert len(body["sentiment"]["items"]) == 5
    assert body["sentiment"]["items"][4]["color"] == "bad"
    assert body["driverDelta"]["items"][0]["delta"] == "+22%"


def test_agents_table_shape(client):
    body = client.get("/api/agents").json()
    assert body["title"] == "Retention agents — W30"
    assert len(body["rows"]) == 8
    assert body["rows"][0] == {"name": "Marcus Webb", "sent": "1.8", "calls": 23,
                               "esc": "26%", "color": "bad"}


def test_transcripts_list_and_detail(client):
    body = client.get("/api/transcripts").json()
    assert body["header"] == "Marcus Webb — lowest sentiment"
    assert body["counter"] == "3 of 23 calls"
    assert [t["id"] for t in body["items"]] == \
        ["CALL-88214", "CALL-88317", "CALL-88423"]
    first = body["items"][0]
    assert first["labels"] == ["Cancellation", "Repeat request", "Offer after intent"]
    assert first["turns"][1]["agent"] is True

    detail = client.get("/api/transcripts/CALL-88317").json()
    assert detail["score"] == "1.5"
    assert client.get("/api/transcripts/CALL-00000").status_code == 404


def test_pipeline_health(client):
    stages = client.get("/api/pipeline/health").json()
    assert [s["label"] for s in stages] == \
        ["WAV ingest", "Transcription", "Labeling — Claude Opus", "Gold tables"]
    assert stages[3]["level"] == "warn"
    assert stages[3]["status"] == "LAG 12m"


def test_labeling_prompts(client):
    prompts = client.get("/api/prompts").json()
    assert len(prompts) == 4
    assert {p["model"] for p in prompts} == {"OPUS", "SONNET"}

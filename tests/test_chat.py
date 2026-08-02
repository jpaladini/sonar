def _send(client, message, conv_id=None):
    payload = {"message": message}
    if conv_id:
        payload["conversationId"] = conv_id
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    return res.json()


def test_chat_creates_conversation_with_truncated_title(client):
    long_q = "Show me every single call driver across all queues for the year"
    body = _send(client, long_q)
    assert body["created"] is True
    assert body["title"] == long_q[:34] + "…"
    assert body["message"]["isAssistant"] is True
    conv = client.get(f"/api/conversations/{body['conversationId']}").json()
    assert conv["messages"][0] == {"isUser": True, "text": long_q}
    assert conv["messages"][1]["isAssistant"] is True


def test_chat_routes_drivers_to_bars_block(client):
    body = _send(client, "Primary call drivers last week")
    kinds = [next(k for k in b if k.startswith("is")) for b in body["message"]["blocks"]]
    assert kinds == ["isText", "isBars", "isText"]
    bars = body["message"]["blocks"][1]
    assert bars["title"].startswith("Call drivers")
    assert bars["items"][0]["label"] == "Billing disputes"


def test_chat_routes_sentiment_to_table_block(client):
    body = _send(client, "Categories with low sentiment")
    blocks = body["message"]["blocks"]
    assert blocks[1]["isTable"] is True
    assert blocks[1]["headers"] == ["Category", "Avg sentiment", "Δ WoW", "Flag"]
    low_cell = blocks[1]["rows"][0]["cells"][1]
    assert low_cell["text"] == "2.1 / 5"
    assert low_cell["color"] == "bad"


def test_chat_routes_agents_to_agent_cards(client):
    body = _send(client, "Agents below sentiment average")
    blocks = body["message"]["blocks"]
    assert blocks[1]["isAgents"] is True
    assert blocks[1]["items"][0]["name"] == "Marcus Webb"
    assert blocks[1]["items"][0]["tab"] == "data"


def test_chat_routes_transcripts_to_chips(client):
    body = _send(client, "Pull the call bodies for Marcus Webb this week.")
    blocks = body["message"]["blocks"]
    assert blocks[1]["isChips"] is True
    assert blocks[1]["items"][0]["label"] == "CALL-88214"
    assert blocks[1]["items"][0]["tab"] == "transcripts"


def test_chat_routes_escalation_to_trend_bars(client):
    body = _send(client, "Escalation rate trend, 30 days")
    blocks = body["message"]["blocks"]
    assert blocks[1]["isBars"] is True
    assert "Escalation" in blocks[1]["title"]


def test_chat_default_route(client):
    body = _send(client, "hello there")
    blocks = body["message"]["blocks"]
    assert blocks[0]["isText"] is True
    assert blocks[1]["isBars"] is True
    assert blocks[1]["title"] == "Relevant slice · current window"


def test_chat_appends_to_existing_conversation(client):
    first = _send(client, "hello")
    second = _send(client, "drivers please", first["conversationId"])
    assert second["created"] is False
    conv = client.get(f"/api/conversations/{first['conversationId']}").json()
    assert len(conv["messages"]) == 4


def test_chat_rejects_blank_message(client):
    res = client.post("/api/chat", json={"message": "   "})
    assert res.status_code == 422

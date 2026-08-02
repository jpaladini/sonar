def test_list_seeded_conversations(client):
    convs = client.get("/api/conversations").json()
    ids = [c["id"] for c in convs]
    assert ids == ["c1", "c2", "c3", "p1", "p2", "w1", "w2"]
    c1 = convs[0]
    assert c1["title"] == "Call drivers & sentiment — W30"
    assert c1["messageCount"] == 8
    assert "messages" not in c1
    assert any(c["pinned"] for c in convs)


def test_create_patch_delete_conversation(client):
    created = client.post("/api/conversations",
                          json={"title": "Test conv", "sub": "sub"})
    assert created.status_code == 201
    cid = created.json()["id"]

    patched = client.patch(f"/api/conversations/{cid}",
                           json={"pinned": True, "title": "Renamed"})
    assert patched.json()["pinned"] is True
    assert patched.json()["title"] == "Renamed"

    assert client.delete(f"/api/conversations/{cid}").status_code == 204
    assert client.get(f"/api/conversations/{cid}").status_code == 404


def test_get_missing_conversation_404(client):
    assert client.get("/api/conversations/nope").status_code == 404
    assert client.patch("/api/conversations/nope", json={"title": "x"}).status_code == 404
    assert client.delete("/api/conversations/nope").status_code == 404


def test_users_are_isolated(client):
    client.delete("/api/conversations/c1")
    other = client.get("/api/conversations",
                       headers={"X-Forwarded-Email": "other@acme.com"}).json()
    assert any(c["id"] == "c1" for c in other)
    mine = client.get("/api/conversations").json()
    assert not any(c["id"] == "c1" for c in mine)


def test_seeded_messages_match_block_schema(client):
    conv = client.get("/api/conversations/c1").json()
    flags = {"isText", "isBars", "isTable", "isAgents", "isChips"}
    for msg in conv["messages"]:
        assert msg.get("isUser") or msg.get("isAssistant")
        if msg.get("isAssistant"):
            for block in msg["blocks"]:
                assert flags & set(block.keys())

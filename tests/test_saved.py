def test_saved_seeded(client):
    items = client.get("/api/saved").json()
    assert [i["id"] for i in items] == ["s1", "s2", "s3"]
    assert items[0]["title"] == "Weekly driver report — W30"


def test_saved_create_and_delete(client):
    created = client.post("/api/saved", json={
        "title": "New saved thing", "desc": "d", "meta": "Saved now · report"})
    assert created.status_code == 201
    new_id = created.json()["id"]

    items = client.get("/api/saved").json()
    assert items[0]["id"] == new_id

    assert client.delete(f"/api/saved/{new_id}").status_code == 204
    assert client.delete(f"/api/saved/{new_id}").status_code == 404


def test_saved_requires_title(client):
    assert client.post("/api/saved", json={"desc": "no title"}).status_code == 422

def test_post_session_returns_created_payload(client):
    response = client.post(
        "/api/sessions",
        json={
            "name": "李四",
            "gender": "female",
            "age": 28,
        },
    )
    body = response.json()
    assert response.status_code == 201
    assert body["session_status"] == "created"

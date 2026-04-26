def test_admin_list_returns_completed_sessions(client, completed_session):
    response = client.get("/api/admin/records")
    body = response.json()
    assert response.status_code == 200
    assert body["items"][0]["session_status"] == "completed"

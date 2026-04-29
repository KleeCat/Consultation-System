def test_admin_list_returns_completed_sessions(client, completed_session):
    response = client.get("/api/admin/records")
    body = response.json()
    assert response.status_code == 200
    assert body["items"][0]["session_status"] == "completed"


def test_admin_detail_returns_completed_session_snapshot(client, completed_session):
    response = client.get(f"/api/admin/records/{completed_session['session_id']}")
    body = response.json()
    assert response.status_code == 200
    assert body["session_id"] == completed_session["session_id"]
    assert body["session_status"] == "completed"
    assert "patient_name" in body

def test_analyze_route_returns_primary_constitution(client, prepared_session):
    response = client.post(f"/api/sessions/{prepared_session['session_id']}/analyze")
    body = response.json()
    assert response.status_code == 200
    assert body["primary_constitution"] in {"qi_deficiency", "yang_deficiency"}
    assert body["confidence_level"] in {"high", "medium", "low"}

def test_submit_answers_returns_questionnaire_summary(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={
            "answers": [
                {
                    "question_code": "fatigue_level",
                    "answer_value": "often",
                }
            ]
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["session_status"] == "questionnaire_completed"
    assert body["summary"]["qi_deficiency"] >= 0

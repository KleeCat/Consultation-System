def test_submit_answers_returns_questionnaire_summary(client, session_id, complete_questionnaire_answers):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": complete_questionnaire_answers},
    )
    body = response.json()
    assert response.status_code == 200
    assert body["session_status"] == "questionnaire_completed"
    assert body["summary"]["qi_deficiency"] >= 0


def test_submit_answers_rejects_unknown_question_code(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": [{"question_code": "unknown_code", "answer_value": "x"}]},
    )

    assert response.status_code == 400
    assert "unknown question_code" in response.json()["detail"]


def test_submit_answers_rejects_invalid_answer_value(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={"answers": [{"question_code": "fatigue_level", "answer_value": "bad_value"}]},
    )

    assert response.status_code == 400
    assert "invalid answer_value" in response.json()["detail"]


def test_submit_answers_rejects_missing_required_questions(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/questionnaire",
        json={
            "answers": [
                {
                    "question_code": "fatigue_level",
                    "answer_value": "energetic",
                }
            ]
        },
    )

    assert response.status_code == 400
    assert "missing required questions" in response.json()["detail"]

def test_get_questionnaire_template_returns_groups_questions_and_version(client):
    response = client.get("/api/questionnaire/template")
    body = response.json()

    assert response.status_code == 200
    assert body["questionnaire_code"] == "tcm_constitution_questionnaire"
    assert body["version"] == "v1"
    assert body["title"]
    assert len(body["groups"]) == 3
    assert len(body["questions"]) == 13
    assert {group["group_code"] for group in body["groups"]} == {
        "body_sensation",
        "diet_sleep_excretion",
        "emotion_lifestyle",
    }
    assert all(question["question_type"] == "single_choice" for question in body["questions"])

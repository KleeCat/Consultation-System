from backend.app.engines.questionnaire_scorer import score_questionnaire


def test_questionnaire_scorer_maps_answers_to_constitution_scores():
    answers = {
        "fatigue_level": "often",
        "cold_hands_feet": "always",
    }
    result = score_questionnaire(answers)
    assert result["qi_deficiency"] > result["balanced"]
    assert result["yang_deficiency"] > 0

from backend.app.engines.questionnaire_scorer import score_questionnaire


def test_questionnaire_scorer_maps_answers_to_constitution_scores():
    answers = {
        "fatigue_level": "slight_activity_tired",
        "cold_hands_feet": "often_need_more_clothes",
        "sleep_quality": "hard_to_fall_asleep",
        "emotion_state": "often_depressed",
    }
    result = score_questionnaire(answers)
    assert result["qi_deficiency"] > result["balanced"]
    assert result["yang_deficiency"] > 0
    assert result["yin_deficiency"] > 0
    assert result["qi_stagnation"] > 0

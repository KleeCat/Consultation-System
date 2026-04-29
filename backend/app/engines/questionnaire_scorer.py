from pathlib import Path

import yaml

from backend.app.core.config import BASE_DIR


QUESTION_SCORING_PATH = BASE_DIR / "config" / "question_scoring.yaml"


def score_questionnaire(answers: dict[str, str]) -> dict[str, float]:
    config = yaml.safe_load(QUESTION_SCORING_PATH.read_text(encoding="utf-8"))
    result = {constitution: 0.0 for constitution in config["constitutions"]}

    for question_code, answer_value in answers.items():
        question_rules = config["scoring"].get(question_code, {})
        answer_rules = question_rules.get(answer_value, {})
        for constitution, score in answer_rules.items():
            result[constitution] += float(score)

    return result

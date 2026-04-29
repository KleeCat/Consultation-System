from pathlib import Path

import yaml
from sqlmodel import Session

from backend.app.core.config import BASE_DIR
from backend.app.engines.questionnaire_scorer import score_questionnaire
from backend.app.models import QuestionnaireAnswer
from backend.app.repositories.questionnaire_repo import QuestionnaireRepository
from backend.app.schemas.questionnaire import QuestionnaireAnswerInput


QUESTIONNAIRE_PATH = BASE_DIR / "config" / "questionnaire.yaml"


class QuestionnaireService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = QuestionnaireRepository(db)
        self.config = yaml.safe_load(QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
        self.question_map = {item["question_code"]: item for item in self.config["questions"]}

    def get_template(self) -> dict[str, object]:
        return {
            "questionnaire_code": self.config["questionnaire_code"],
            "version": self.config["version"],
            "title": self.config["title"],
            "description": self.config["description"],
            "groups": self.config["groups"],
            "questions": [
                {
                    "question_code": question["question_code"],
                    "group_code": question["group_code"],
                    "question_text": question["question_text"],
                    "question_help": question.get("question_help"),
                    "required": question.get("required", True),
                    "question_type": question["question_type"],
                    "options": question["options"],
                }
                for question in self.config["questions"]
            ],
        }

    def submit_answers(self, session_id: int, answers: list[QuestionnaireAnswerInput]) -> tuple[str, dict[str, float]]:
        seen_codes: set[str] = set()
        answer_dict: dict[str, str] = {}
        normalized_answers: list[tuple[QuestionnaireAnswerInput, dict[str, object], dict[str, object]]] = []

        for item in answers:
            if item.question_code not in self.question_map:
                raise ValueError(f"unknown question_code: {item.question_code}")
            if item.question_code in seen_codes:
                raise ValueError(f"duplicate question_code: {item.question_code}")

            question = self.question_map[item.question_code]
            option_map = {opt["value"]: opt for opt in question["options"]}
            option = option_map.get(item.answer_value)
            if option is None:
                raise ValueError(f"invalid answer_value for {item.question_code}: {item.answer_value}")

            seen_codes.add(item.question_code)
            normalized_answers.append((item, question, option))
            answer_dict[item.question_code] = item.answer_value

        required_codes = {
            question["question_code"]
            for question in self.config["questions"]
            if question.get("required", True)
        }
        missing_codes = sorted(required_codes - seen_codes)
        if missing_codes:
            raise ValueError(f"missing required questions: {', '.join(missing_codes)}")

        consultation_session = self.repo.get_session(session_id=session_id)
        if consultation_session is None:
            raise ValueError(f"session not found: {session_id}")

        for item, question, option in normalized_answers:
            answer = QuestionnaireAnswer(
                session_id=session_id,
                question_code=item.question_code,
                question_text_snapshot=question["question_text"],
                answer_value=item.answer_value,
                answer_label=option["label"],
                dimension_code=question["dimension_code"],
                score_contribution=0,
            )
            self.repo.save_answer(answer)

        summary = score_questionnaire(answer_dict)
        self.repo.update_session_questionnaire(
            consultation_session,
            "questionnaire_completed",
            self.config["version"],
        )
        return consultation_session.session_status, summary

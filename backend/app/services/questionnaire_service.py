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
        config = yaml.safe_load(QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
        self.question_map = {item["question_code"]: item for item in config["questions"]}

    def submit_answers(self, session_id: int, answers: list[QuestionnaireAnswerInput]) -> tuple[str, dict[str, float]]:
        answer_dict: dict[str, str] = {}
        for item in answers:
            question = self.question_map[item.question_code]
            option = next(opt for opt in question["options"] if opt["value"] == item.answer_value)
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
            answer_dict[item.question_code] = item.answer_value

        summary = score_questionnaire(answer_dict)
        consultation_session = self.repo.get_session(session_id=session_id)
        self.repo.update_session_status(consultation_session, "questionnaire_completed")
        return consultation_session.session_status, summary

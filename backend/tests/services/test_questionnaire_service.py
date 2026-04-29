from sqlmodel import Session

from backend.app.repositories.questionnaire_repo import QuestionnaireRepository
from backend.app.schemas.questionnaire import QuestionnaireAnswerInput
from backend.app.services.questionnaire_service import QuestionnaireService


def test_submit_answers_writes_questionnaire_version(
    test_engine,
    session_service,
    complete_questionnaire_answers,
):
    consultation_session = session_service.create_session(name="测试患者", gender="female", age=30)

    with Session(test_engine) as db:
        service = QuestionnaireService(db)
        service.submit_answers(
            consultation_session.session_id,
            [QuestionnaireAnswerInput(**item) for item in complete_questionnaire_answers],
        )
        stored = QuestionnaireRepository(db).get_session(consultation_session.session_id)

    assert stored is not None
    assert stored.questionnaire_version == "v1"

from sqlmodel import Session, select

from backend.app.models import ConsultationSession, QuestionnaireAnswer


class QuestionnaireRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_answer(self, answer: QuestionnaireAnswer) -> QuestionnaireAnswer:
        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)
        return answer

    def get_session(self, session_id: int) -> ConsultationSession | None:
        return self.db.exec(
            select(ConsultationSession).where(ConsultationSession.session_id == session_id)
        ).first()

    def update_session_status(self, consultation_session: ConsultationSession, status: str) -> ConsultationSession:
        consultation_session.session_status = status
        self.db.add(consultation_session)
        self.db.commit()
        self.db.refresh(consultation_session)
        return consultation_session

    def update_session_questionnaire(
        self,
        consultation_session: ConsultationSession,
        status: str,
        questionnaire_version: str,
    ) -> ConsultationSession:
        consultation_session.session_status = status
        consultation_session.questionnaire_version = questionnaire_version
        self.db.add(consultation_session)
        self.db.commit()
        self.db.refresh(consultation_session)
        return consultation_session

from dataclasses import dataclass

from sqlmodel import Session

from backend.app.models import Patient
from backend.app.repositories.session_repo import SessionRepository


@dataclass
class SessionAggregate:
    session_id: int
    patient_id: int
    session_status: str
    patient: Patient


class SessionService:
    def __init__(self, db: Session):
        self.repo = SessionRepository(db)

    def create_session(self, name: str, gender: str, age: int):
        patient = self.repo.create_patient(name=name, gender=gender, age=age)
        consultation_session = self.repo.create_consultation_session(patient_id=patient.patient_id)
        return SessionAggregate(
            session_id=consultation_session.session_id,
            patient_id=patient.patient_id,
            session_status=consultation_session.session_status,
            patient=patient,
        )

    def get_session(self, session_id: int):
        consultation_session = self.repo.get_session(session_id=session_id)
        if consultation_session is None:
            return None

        patient = self.repo.get_patient(patient_id=consultation_session.patient_id)
        return SessionAggregate(
            session_id=consultation_session.session_id,
            patient_id=consultation_session.patient_id,
            session_status=consultation_session.session_status,
            patient=patient,
        )

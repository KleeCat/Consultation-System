from sqlmodel import Session, select

from backend.app.models import ConsultationSession, Patient


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_patient(self, name: str, gender: str, age: int) -> Patient:
        patient = Patient(name=name, gender=gender, age=age)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def create_consultation_session(self, patient_id: int) -> ConsultationSession:
        consultation_session = ConsultationSession(patient_id=patient_id, session_status="created")
        self.db.add(consultation_session)
        self.db.commit()
        self.db.refresh(consultation_session)
        return consultation_session

    def get_patient(self, patient_id: int) -> Patient | None:
        return self.db.exec(select(Patient).where(Patient.patient_id == patient_id)).first()

    def get_session(self, session_id: int) -> ConsultationSession | None:
        return self.db.exec(
            select(ConsultationSession).where(ConsultationSession.session_id == session_id)
        ).first()

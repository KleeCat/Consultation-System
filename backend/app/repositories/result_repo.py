import json

from sqlmodel import Session, select

from backend.app.models import (
    ConsultationSession,
    ConstitutionResult,
    Patient,
    QuestionnaireAnswer,
    ResultReport,
    TongueCapture,
    TongueFeature,
)


class ResultRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_session(self, session_id: int) -> ConsultationSession | None:
        return self.db.exec(
            select(ConsultationSession).where(ConsultationSession.session_id == session_id)
        ).first()

    def get_patient(self, patient_id: int) -> Patient | None:
        return self.db.exec(select(Patient).where(Patient.patient_id == patient_id)).first()

    def get_answers(self, session_id: int) -> list[QuestionnaireAnswer]:
        return list(
            self.db.exec(
                select(QuestionnaireAnswer).where(QuestionnaireAnswer.session_id == session_id)
            ).all()
        )

    def get_selected_capture(self, session_id: int) -> TongueCapture | None:
        return self.db.exec(
            select(TongueCapture).where(
                TongueCapture.session_id == session_id,
                TongueCapture.is_selected == True,  # noqa: E712
            )
        ).first()

    def save_feature(self, feature: TongueFeature) -> TongueFeature:
        self.db.add(feature)
        self.db.commit()
        self.db.refresh(feature)
        return feature

    def save_result(self, result: ConstitutionResult) -> ConstitutionResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def save_report(self, report: ResultReport) -> ResultReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def mark_session_completed(self, consultation_session: ConsultationSession, result_id: int) -> ConsultationSession:
        consultation_session.session_status = "completed"
        consultation_session.result_id = result_id
        self.db.add(consultation_session)
        self.db.commit()
        self.db.refresh(consultation_session)
        return consultation_session

    def list_completed_records(self) -> list[dict]:
        sessions = list(
            self.db.exec(
                select(ConsultationSession).where(ConsultationSession.session_status == "completed")
            ).all()
        )
        items: list[dict] = []
        for consultation_session in sessions:
            patient = self.get_patient(consultation_session.patient_id)
            result = None
            if consultation_session.result_id:
                result = self.db.exec(
                    select(ConstitutionResult).where(
                        ConstitutionResult.result_id == consultation_session.result_id
                    )
                ).first()
            items.append(
                {
                    "session_id": consultation_session.session_id,
                    "patient_name": patient.name if patient else "未知患者",
                    "session_status": consultation_session.session_status,
                    "primary_constitution": result.primary_constitution if result else None,
                    "confidence_level": result.confidence_level if result else None,
                    "risk_level": result.risk_level if result else None,
                }
            )
        return items

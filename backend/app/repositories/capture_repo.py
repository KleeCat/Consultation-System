from sqlmodel import Session, select

from backend.app.models import ConsultationSession, TongueCapture


class CaptureRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_session(self, session_id: int) -> ConsultationSession | None:
        return self.db.exec(
            select(ConsultationSession).where(ConsultationSession.session_id == session_id)
        ).first()

    def save_capture(self, capture: TongueCapture) -> TongueCapture:
        self.db.add(capture)
        self.db.commit()
        self.db.refresh(capture)
        return capture

    def get_capture(self, capture_id: int) -> TongueCapture | None:
        return self.db.exec(
            select(TongueCapture).where(TongueCapture.capture_id == capture_id)
        ).first()

    def select_capture(self, session_id: int, capture_id: int) -> TongueCapture | None:
        captures = self.db.exec(
            select(TongueCapture).where(TongueCapture.session_id == session_id)
        ).all()
        selected_capture = None
        for capture in captures:
            capture.is_selected = capture.capture_id == capture_id
            if capture.is_selected:
                selected_capture = capture
            self.db.add(capture)

        consultation_session = self.get_session(session_id)
        if consultation_session and selected_capture:
            consultation_session.selected_capture_id = selected_capture.capture_id
            self.db.add(consultation_session)

        self.db.commit()
        if selected_capture:
            self.db.refresh(selected_capture)
        return selected_capture

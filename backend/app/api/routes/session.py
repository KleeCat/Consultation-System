from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.session import SessionCreateRequest, SessionResponse
from backend.app.services.session_service import SessionService


router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(payload: SessionCreateRequest, db: Session = Depends(get_session)) -> SessionResponse:
    service = SessionService(db)
    consultation_session = service.create_session(
        name=payload.name,
        gender=payload.gender,
        age=payload.age,
    )
    patient = consultation_session.patient
    return SessionResponse(
        session_id=consultation_session.session_id,
        patient_id=consultation_session.patient_id,
        name=patient.name,
        gender=patient.gender,
        age=patient.age,
        session_status=consultation_session.session_status,
    )


@router.get("/{session_id}", response_model=SessionResponse)
def get_session_by_id(session_id: int, db: Session = Depends(get_session)) -> SessionResponse:
    service = SessionService(db)
    consultation_session = service.get_session(session_id=session_id)
    if consultation_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    patient = consultation_session.patient
    return SessionResponse(
        session_id=consultation_session.session_id,
        patient_id=consultation_session.patient_id,
        name=patient.name,
        gender=patient.gender,
        age=patient.age,
        session_status=consultation_session.session_status,
    )

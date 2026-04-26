from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.repositories.capture_repo import CaptureRepository
from backend.app.schemas.capture import CaptureCreateRequest, CaptureResponse, CaptureSelectResponse
from backend.app.services.capture_service import CaptureService


router = APIRouter(prefix="/api/sessions", tags=["captures"])


@router.post("/{session_id}/captures", response_model=CaptureResponse, status_code=status.HTTP_201_CREATED)
def create_capture(
    session_id: int,
    payload: CaptureCreateRequest,
    db: Session = Depends(get_session),
) -> CaptureResponse:
    repo = CaptureRepository(db)
    if repo.get_session(session_id=session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")

    capture = CaptureService(db).create_capture(session_id=session_id, image_base64=payload.image_base64)
    return CaptureResponse(
        capture_id=capture.capture_id,
        session_id=capture.session_id,
        quality_status=capture.quality_status,
        brightness_score=capture.brightness_score,
        blur_score=capture.blur_score,
        position_score=capture.position_score,
        image_path=capture.image_path,
    )


@router.post("/{session_id}/captures/{capture_id}/select", response_model=CaptureSelectResponse)
def select_capture(
    session_id: int,
    capture_id: int,
    db: Session = Depends(get_session),
) -> CaptureSelectResponse:
    capture = CaptureService(db).select_capture(session_id=session_id, capture_id=capture_id)
    if capture is None:
        raise HTTPException(status_code=404, detail="Capture not found")

    return CaptureSelectResponse(
        capture_id=capture.capture_id,
        session_id=capture.session_id,
        is_selected=capture.is_selected,
    )

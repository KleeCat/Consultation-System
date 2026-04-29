from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.admin import (
    AdminRecordDetailResponse,
    AdminRecordItem,
    AdminRecordListResponse,
)
from backend.app.services.admin_service import AdminService


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/records", response_model=AdminRecordListResponse)
def list_records(db: Session = Depends(get_session)) -> AdminRecordListResponse:
    items = [AdminRecordItem(**item) for item in AdminService(db).list_records()]
    return AdminRecordListResponse(items=items)


@router.get("/records/{session_id}", response_model=AdminRecordDetailResponse)
def get_record_detail(session_id: int, db: Session = Depends(get_session)) -> AdminRecordDetailResponse:
    detail = AdminService(db).get_record_detail(session_id=session_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return AdminRecordDetailResponse(**detail)

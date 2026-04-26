from fastapi import APIRouter, Depends
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.admin import AdminRecordItem, AdminRecordListResponse
from backend.app.services.admin_service import AdminService


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/records", response_model=AdminRecordListResponse)
def list_records(db: Session = Depends(get_session)) -> AdminRecordListResponse:
    items = [AdminRecordItem(**item) for item in AdminService(db).list_records()]
    return AdminRecordListResponse(items=items)

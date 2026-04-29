from sqlmodel import Session

from backend.app.repositories.result_repo import ResultRepository


class AdminService:
    def __init__(self, db: Session):
        self.repo = ResultRepository(db)

    def list_records(self) -> list[dict]:
        return self.repo.list_completed_records()

    def get_record_detail(self, session_id: int) -> dict | None:
        return self.repo.get_record_detail(session_id=session_id)

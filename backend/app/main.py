from fastapi import FastAPI

from backend.app.api.routes.session import router as session_router
from backend.app.core.database import create_db_and_tables


app = FastAPI(title="Intelligent TCM Consultation System")

app.include_router(session_router)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

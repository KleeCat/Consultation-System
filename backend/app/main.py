from fastapi import FastAPI

from backend.app.api.routes.admin import router as admin_router
from backend.app.api.routes.analysis import router as analysis_router
from backend.app.api.routes.capture import router as capture_router
from backend.app.api.routes.questionnaire import router as questionnaire_router
from backend.app.api.routes.session import router as session_router
from backend.app.core.database import create_db_and_tables


app = FastAPI(title="Intelligent TCM Consultation System")

app.include_router(session_router)
app.include_router(questionnaire_router)
app.include_router(capture_router)
app.include_router(analysis_router)
app.include_router(admin_router)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

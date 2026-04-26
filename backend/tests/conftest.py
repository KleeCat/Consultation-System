from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from backend.app.core import database as database_module
from backend.app.main import app
from backend.app.services.analysis_service import AnalysisService
from backend.app.services.session_service import SessionService


@pytest.fixture()
def test_engine(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    monkeypatch.setattr(database_module, "engine", engine)
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture()
def session_service(test_engine) -> Generator[SessionService, None, None]:
    with Session(test_engine) as db:
        yield SessionService(db)


@pytest.fixture()
def client(test_engine):
    def override_get_session():
        with Session(test_engine) as db:
            yield db

    app.dependency_overrides[database_module.get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def session_id(client) -> int:
    response = client.post(
        "/api/sessions",
        json={
            "name": "测试患者",
            "gender": "female",
            "age": 32,
        },
    )
    return response.json()["session_id"]


@pytest.fixture()
def prepared_session(client) -> dict:
    session_response = client.post(
        "/api/sessions",
        json={
            "name": "分析患者",
            "gender": "female",
            "age": 35,
        },
    )
    current_session_id = session_response.json()["session_id"]
    client.post(
        f"/api/sessions/{current_session_id}/questionnaire",
        json={
            "answers": [
                {"question_code": "fatigue_level", "answer_value": "often"},
                {"question_code": "cold_hands_feet", "answer_value": "always"},
            ]
        },
    )
    import base64
    from io import BytesIO

    from PIL import Image

    image = Image.new("RGB", (64, 64), color=(200, 170, 160))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    image_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    capture_response = client.post(
        f"/api/sessions/{current_session_id}/captures",
        json={"image_base64": image_b64},
    )
    capture_id = capture_response.json()["capture_id"]
    client.post(f"/api/sessions/{current_session_id}/captures/{capture_id}/select")
    return {"session_id": current_session_id, "capture_id": capture_id}


@pytest.fixture()
def analysis_service(test_engine):
    with Session(test_engine) as db:
        yield AnalysisService(db)


@pytest.fixture()
def completed_session(client, prepared_session):
    client.post(f"/api/sessions/{prepared_session['session_id']}/analyze")
    return prepared_session

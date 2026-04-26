from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from backend.app.core import database as database_module
from backend.app.main import app
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

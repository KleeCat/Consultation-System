from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from backend.app.core.config import DB_PATH


engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    from backend.app.models import consultation_session, constitution_result, patient, questionnaire_answer, result_report, tongue_capture, tongue_feature  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

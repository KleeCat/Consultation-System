def test_create_session_sets_created_status(session_service):
    session = session_service.create_session(
        name="张三",
        gender="male",
        age=30,
    )
    assert session.session_status == "created"
    assert session.patient.name == "张三"

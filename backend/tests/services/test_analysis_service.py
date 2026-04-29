def test_analysis_service_combines_questionnaire_and_tongue_scores(analysis_service, prepared_session):
    result = analysis_service.run(prepared_session["session_id"])
    assert result.primary_constitution in {"qi_deficiency", "yang_deficiency"}
    assert result.confidence_level in {"high", "medium", "low"}
    assert "diet_advice" in result.report.display_payload

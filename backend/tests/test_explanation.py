from app.explanation import _llm_failure_message


def test_llm_failure_message_quota():
    exc = Exception(
        "Error code: 429 - {'error': {'code': 'insufficient_quota', 'message': 'You exceeded your current quota'}}"
    )
    message = _llm_failure_message(exc)
    assert "quota exceeded" in message.lower()
    assert "billing" in message.lower()


def test_llm_failure_message_generic():
    message = _llm_failure_message(Exception("something else"))
    assert "rule-based" in message.lower()

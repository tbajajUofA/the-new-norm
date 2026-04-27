from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_predict_without_model_returns_503():
    res = client.get("/predict", params={"lat": 53.55, "lon": -113.47})
    assert res.status_code == 503


def test_metrics_endpoint_available():
    res = client.get("/metrics")
    assert res.status_code == 200
    body = res.json()
    assert "model_loaded_at" in body
    assert "requests_served" in body

from fastapi.testclient import TestClient

from app.main import app
from app.routes import climate as climate_routes

client = TestClient(app)


def test_crossing_endpoint_returns_projection(monkeypatch):
    monkeypatch.setattr(
        climate_routes,
        "find_crossing_year",
        lambda anomalies: {
            "crossingYear": 2047,
            "low": 2042,
            "high": 2055,
            "currentAnomaly": 1.12,
            "lastSmoothedValue": 1.05,
            "forecastMedian": [1.0, 1.1],
            "forecastLow": [0.9, 1.0],
            "forecastHigh": [1.2, 1.3],
            "forecastYears": [2025, 2026],
        },
    )

    res = client.post("/api/climate/crossing", json={"anomalies": [0.1] * 40})
    assert res.status_code == 200
    assert res.json()["crossingYear"] == 2047


def test_regime_endpoint_returns_summary(monkeypatch):
    monkeypatch.setattr(
        climate_routes,
        "classify_regime",
        lambda anomalies: {
            "regime": "accelerating",
            "label": "Accelerating",
            "emoji": "🟡",
            "acceleration": 0.02,
            "forecastVariance": 0.3,
            "summary": "Warming is speeding up in a consistent, predictable way.",
        },
    )

    res = client.post("/api/climate/regime", json={"anomalies": [0.1] * 40})
    assert res.status_code == 200
    assert res.json()["regime"] == "accelerating"

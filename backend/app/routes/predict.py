from fastapi import APIRouter, HTTPException, Query

from app.schemas.prediction import (
    CustomPredictionRequest,
    HealthResponse,
    MetricsResponse,
    PredictionResponse,
)
from app.services.inference import service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok"}


@router.get("/predict", response_model=PredictionResponse)
def predict(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    result = service.predict(lat, lon)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


@router.post("/predict/custom", response_model=PredictionResponse)
def predict_custom(body: CustomPredictionRequest):
    result = service.predict(body.lat, body.lon)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


@router.get("/metrics", response_model=MetricsResponse)
def metrics():
    return service.get_metrics()

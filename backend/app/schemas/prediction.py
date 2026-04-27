from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str


class PredictionResponse(BaseModel):
    temps: List[float]
    peak_day: int
    peak_temp: float
    heat_risk: float
    anomaly: float
    forecast_days: int


class CustomPredictionRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class MetricsResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_loaded_at: Optional[str]
    requests_served: int
    model_path: str
    scaler_path: str
    is_ready: bool

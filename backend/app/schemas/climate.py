from pydantic import BaseModel


class AnomalyRequest(BaseModel):
    anomalies: list[float]


class CrossingResponse(BaseModel):
    crossingYear: int | None
    low: int | None
    high: int | None
    currentAnomaly: float
    lastSmoothedValue: float
    forecastMedian: list[float]
    forecastLow: list[float]
    forecastHigh: list[float]
    forecastYears: list[int]


class Forecast5Response(BaseModel):
    years: list[int]
    median: list[float]
    low: list[float]
    high: list[float]
    lastSmoothedValue: float


class RegimeResponse(BaseModel):
    regime: str
    label: str
    emoji: str
    acceleration: float
    forecastVariance: float
    summary: str
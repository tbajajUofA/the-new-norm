import asyncio
import json
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.climate import AnomalyRequest, CrossingResponse, Forecast5Response, RegimeResponse
from ml.chronos_forecast import forecast_anomalies
from ml.crossing_predictor import find_crossing_year
from ml.crossing_predictor import LAST_DATA_YEAR
from ml.tipping_detector import classify_regime

router = APIRouter(prefix="/api/climate", tags=["climate"])
executor = ThreadPoolExecutor(max_workers=2)


def _build_stream_result(anomalies: list[float]):
    low_fc, median_fc, high_fc, last_val = forecast_anomalies(anomalies, prediction_length=5)
    anchor = round(float(last_val), 4)

    return {
        "crossing": find_crossing_year(anomalies),
        "regime": classify_regime(anomalies),
        "forecast5": {
            "years": [LAST_DATA_YEAR] + list(range(LAST_DATA_YEAR + 1, LAST_DATA_YEAR + 6)),
            "median": [anchor] + median_fc.tolist(),
            "low": [anchor] + low_fc.tolist(),
            "high": [anchor] + high_fc.tolist(),
            "lastSmoothedValue": anchor,
        },
    }


@router.post("/crossing", response_model=CrossingResponse)
def get_crossing_year(body: AnomalyRequest):
    if len(body.anomalies) < 20:
        raise HTTPException(status_code=400, detail="Need at least 20 years of anomaly data.")
    return find_crossing_year(body.anomalies)


@router.post("/regime", response_model=RegimeResponse)
def get_regime(body: AnomalyRequest):
    if len(body.anomalies) < 40:
        raise HTTPException(status_code=400, detail="Need at least 40 years of anomaly data for regime classification.")
    return classify_regime(body.anomalies)


@router.post("/forecast5", response_model=Forecast5Response)
def get_5year_forecast(body: AnomalyRequest):
    if len(body.anomalies) < 20:
        raise HTTPException(status_code=400, detail="Need at least 20 years of anomaly data.")

    low_fc, median_fc, high_fc, last_val = forecast_anomalies(body.anomalies, prediction_length=5)
    anchor = round(float(last_val), 4)

    return {
        "years": [LAST_DATA_YEAR] + list(range(LAST_DATA_YEAR + 1, LAST_DATA_YEAR + 6)),
        "median": [anchor] + median_fc.tolist(),
        "low": [anchor] + low_fc.tolist(),
        "high": [anchor] + high_fc.tolist(),
        "lastSmoothedValue": anchor,
    }


@router.post("/crossing/stream")
async def get_crossing_stream(body: AnomalyRequest):
    if len(body.anomalies) < 20:
        raise HTTPException(status_code=400, detail="Need at least 20 years of anomaly data.")

    async def event_stream():
        steps = [
            (5, "Loading Chronos model..."),
            (20, "Smoothing anomaly series..."),
            (45, "Running probabilistic forecast..."),
            (70, "Computing uncertainty bands..."),
            (90, "Detecting climate regime..."),
        ]

        loop = asyncio.get_running_loop()
        future = loop.run_in_executor(executor, _build_stream_result, body.anomalies)

        for pct, label in steps:
            yield f"data: {json.dumps({'progress': pct, 'label': label})}\n\n"
            await asyncio.sleep(0.6)
            if future.done():
                break

        result = await future
        yield f"data: {json.dumps({'progress': 100, 'label': 'Complete', 'result': result})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
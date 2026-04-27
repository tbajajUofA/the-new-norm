from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import requests

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


def fetch_recent_data(lat: float, lon: float, days: int = 60) -> pd.DataFrame:
    end = datetime.utcnow().date() - timedelta(days=5)
    start = end - timedelta(days=days)
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": str(start),
        "end_date": str(end),
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "UTC",
    }
    res = requests.get(ARCHIVE_URL, params=params, timeout=15)
    res.raise_for_status()
    data = res.json()["daily"]
    df = pd.DataFrame(
        {
            "date": data["time"],
            "temp_max": data["temperature_2m_max"],
            "temp_min": data["temperature_2m_min"],
        }
    )
    df = df.dropna()
    df["temp_mean"] = (df["temp_max"] + df["temp_min"]) / 2
    return df.reset_index(drop=True)


def make_input_sequence(df: pd.DataFrame, scaler) -> np.ndarray:
    features = df[["temp_max", "temp_min", "temp_mean"]].values[-30:]
    scaled = scaler.transform(features)
    return scaled[np.newaxis, :, :]  # (1, 30, 3)


def compute_heat_risk(forecast_temps: list, threshold: float) -> float:
    if not forecast_temps:
        return 0.0
    hot_days = sum(1 for t in forecast_temps if t > threshold)
    return round(hot_days / len(forecast_temps), 2)

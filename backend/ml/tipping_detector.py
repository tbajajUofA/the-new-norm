import numpy as np

from .chronos_forecast import forecast_anomalies


def linear_slope(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0

    x = np.arange(len(values))
    return float(np.polyfit(x, values, 1)[0])


def classify_regime(anomaly_series: list[float]):
    recent_slice = anomaly_series[-10:]
    historic_slice = anomaly_series[:40]
    recent_slope = linear_slope(recent_slice)
    historic_slope = linear_slope(historic_slice)
    acceleration = round(recent_slope - historic_slope, 4)

    low_fc, _, high_fc, _ = forecast_anomalies(anomaly_series, prediction_length=20)
    forecast_variance = round(float(np.mean(high_fc - low_fc)), 3)

    if acceleration > 0.03 and forecast_variance > 0.8:
        regime = "tipping"
        emoji = "🔴"
        label = "Tipping"
        summary = (
            f"Warming is accelerating sharply and the future trajectory is highly uncertain. "
            f"The rate of warming has increased by {acceleration:.3f}°C/year compared to the 1950–1990 average."
        )
    elif acceleration > 0.01:
        regime = "accelerating"
        emoji = "🟡"
        label = "Accelerating"
        summary = (
            f"Warming is speeding up in a consistent, predictable way. "
            f"The rate of warming has increased by {acceleration:.3f}°C/year compared to the historical baseline."
        )
    else:
        regime = "stable"
        emoji = "🟢"
        label = "Stable"
        summary = (
            f"Warming is progressing at a consistent rate with no significant acceleration detected. "
            f"Rate change: {acceleration:.3f}°C/year vs. historical baseline."
        )

    return {
        "regime": regime,
        "label": label,
        "emoji": emoji,
        "acceleration": acceleration,
        "forecastVariance": forecast_variance,
        "summary": summary,
    }
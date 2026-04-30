from .chronos_forecast import forecast_anomalies

PARIS_THRESHOLD = 1.5
LAST_DATA_YEAR = 2024
FORECAST_YEARS = 76


def find_crossing_year(anomaly_series: list[float]):
    low_fc, median_fc, high_fc, last_val = forecast_anomalies(anomaly_series, FORECAST_YEARS)

    def first_crossing(forecast_array):
        for index, value in enumerate(forecast_array):
            if value >= PARIS_THRESHOLD:
                return LAST_DATA_YEAR + index + 1
        return None

    return {
        "crossingYear": first_crossing(median_fc),
        "low": first_crossing(low_fc),
        "high": first_crossing(high_fc),
        "currentAnomaly": round(float(anomaly_series[-1]), 3),
        "lastSmoothedValue": round(float(last_val), 4),
        "forecastMedian": median_fc.tolist(),
        "forecastLow": low_fc.tolist(),
        "forecastHigh": high_fc.tolist(),
        "forecastYears": list(range(LAST_DATA_YEAR + 1, LAST_DATA_YEAR + FORECAST_YEARS + 1)),
    }
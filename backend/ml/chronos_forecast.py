pipeline = None


def load_model():
    global pipeline

    if pipeline is None:
        import torch
        from chronos import ChronosPipeline

        pipeline = ChronosPipeline.from_pretrained(
            "amazon/chronos-t5-small",
            device_map="cpu",
            torch_dtype=torch.float32,
        )

    return pipeline


def smooth_anomalies(anomaly_series: list[float], window: int = 10) -> list[float]:
    if not anomaly_series:
        raise ValueError("anomaly_series must not be empty")

    import pandas as pd

    series = pd.Series(anomaly_series)
    smoothed = series.rolling(window=window, center=True, min_periods=1).mean()
    return smoothed.tolist()


def forecast_anomalies(anomaly_series: list[float], prediction_length: int = 76):
    if not anomaly_series:
        raise ValueError("anomaly_series must not be empty")

    import numpy as np
    import torch

    model = load_model()
    smoothed = smooth_anomalies(anomaly_series, window=10)
    last_smoothed_value = smoothed[-1]

    context = torch.tensor(smoothed, dtype=torch.float32)

    forecast = model.predict(context, prediction_length, num_samples=100)
    samples = forecast[0].detach().cpu().numpy()

    # Calibration pass: align forecast start and slope with recent local behavior.
    # This reduces systematic bias from heavily smoothed contexts.
    recent_window = min(12, len(anomaly_series))
    recent_actual = np.array(anomaly_series[-recent_window:], dtype=np.float32)
    recent_smooth = np.array(smoothed[-recent_window:], dtype=np.float32)
    recent_bias = float(np.mean(recent_actual - recent_smooth))

    horizon_for_slope = min(10, prediction_length)
    if recent_window >= 2 and horizon_for_slope >= 2:
        actual_x = np.arange(recent_window, dtype=np.float32)
        forecast_x = np.arange(horizon_for_slope, dtype=np.float32)
        actual_slope = float(np.polyfit(actual_x, recent_actual, 1)[0])
        median_preview = np.median(samples[:, :horizon_for_slope], axis=0)
        forecast_slope = float(np.polyfit(forecast_x, median_preview, 1)[0])
        slope_factor = actual_slope / forecast_slope if abs(forecast_slope) > 1e-6 else 1.0
        slope_factor = float(np.clip(slope_factor, 0.75, 1.35))
    else:
        slope_factor = 1.0

    time_index = np.arange(prediction_length, dtype=np.float32)
    slope_adjust = (slope_factor - 1.0) * time_index
    calibrated_samples = samples + recent_bias + slope_adjust

    low = np.quantile(calibrated_samples, 0.1, axis=0)
    median = np.quantile(calibrated_samples, 0.5, axis=0)
    high = np.quantile(calibrated_samples, 0.9, axis=0)

    return low, median, high, last_smoothed_value
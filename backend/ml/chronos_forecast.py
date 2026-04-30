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

    low = np.quantile(samples, 0.1, axis=0)
    median = np.quantile(samples, 0.5, axis=0)
    high = np.quantile(samples, 0.9, axis=0)

    return low, median, high, last_smoothed_value
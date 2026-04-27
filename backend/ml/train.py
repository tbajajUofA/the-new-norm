import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
import pandas as pd
import requests
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset

from ml.transformer import ClimateTransformer

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
LAT = 53.5501
LON = -113.4687
START_DATE = "1950-01-01"
END_DATE = "2024-12-31"
SEQ_LEN = 30
FORECAST_DAYS = 14
BATCH_SIZE = 64
EPOCHS = 30
LR = 1e-3
MODEL_OUT = "ml/saved_model/model.pt"
SCALER_OUT = "ml/saved_model/scaler.pkl"


def fetch_training_data() -> pd.DataFrame:
    params = {
        "latitude": LAT,
        "longitude": LON,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "UTC",
    }
    res = requests.get(ARCHIVE_URL, params=params, timeout=30)
    res.raise_for_status()
    data = res.json()["daily"]

    df = pd.DataFrame(
        {
            "date": data["time"],
            "temp_max": data["temperature_2m_max"],
            "temp_min": data["temperature_2m_min"],
        }
    )
    df = df.dropna().reset_index(drop=True)
    df["temp_mean"] = (df["temp_max"] + df["temp_min"]) / 2
    return df


def make_windows(scaled_features: np.ndarray):
    xs = []
    ys = []
    total = len(scaled_features)

    for i in range(0, total - SEQ_LEN - FORECAST_DAYS + 1):
        x = scaled_features[i : i + SEQ_LEN]
        y = scaled_features[i + SEQ_LEN : i + SEQ_LEN + FORECAST_DAYS, 0]
        xs.append(x)
        ys.append(y)

    return np.array(xs, dtype=np.float32), np.array(ys, dtype=np.float32)


def main():
    df = fetch_training_data()

    features = df[["temp_max", "temp_min", "temp_mean"]].values
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(features)

    os.makedirs(os.path.dirname(SCALER_OUT), exist_ok=True)
    joblib.dump(scaler, SCALER_OUT)

    X, y = make_windows(scaled)

    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]

    train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
    val_ds = TensorDataset(torch.from_numpy(X_val), torch.from_numpy(y_val))

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=False)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False)

    model = ClimateTransformer(forecast_days=FORECAST_DAYS)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    criterion = nn.MSELoss()

    for epoch in range(1, EPOCHS + 1):
        model.train()
        train_losses = []
        for xb, yb in train_loader:
            optimizer.zero_grad()
            pred = model(xb)
            loss = criterion(pred, yb)
            loss.backward()
            optimizer.step()
            train_losses.append(loss.item())

        model.eval()
        val_losses = []
        with torch.no_grad():
            for xb, yb in val_loader:
                pred = model(xb)
                loss = criterion(pred, yb)
                val_losses.append(loss.item())

        if epoch % 5 == 0:
            print(
                f"Epoch {epoch:02d}/{EPOCHS} - "
                f"train_loss={np.mean(train_losses):.6f} "
                f"val_loss={np.mean(val_losses):.6f}"
            )

    torch.save(model.state_dict(), MODEL_OUT)
    print("Training complete. Model saved.")


if __name__ == "__main__":
    main()

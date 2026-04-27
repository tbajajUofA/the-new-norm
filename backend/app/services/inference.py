import logging
from datetime import datetime

import joblib
import torch

from ml.preprocess import compute_heat_risk, fetch_recent_data, make_input_sequence
from ml.transformer import ClimateTransformer

MODEL_PATH = "ml/saved_model/model.pt"
SCALER_PATH = "ml/saved_model/scaler.pkl"
HEAT_THRESHOLD = 28.0


class InferenceService:
    def __init__(self):
        self.ready = False
        self.requests_served = 0
        self.model_loaded_at = None
        try:
            self.model = ClimateTransformer()
            self.model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
            self.model.eval()
            self.scaler = joblib.load(SCALER_PATH)
            self.ready = True
            self.model_loaded_at = datetime.utcnow().isoformat()
            logging.info("Model loaded successfully")
        except FileNotFoundError:
            logging.warning("Model files not found. Run ml/train.py first.")

    def predict(self, lat: float, lon: float) -> dict:
        if not self.ready:
            return {"error": "Model not trained yet. Run ml/train.py first."}

        try:
            df = fetch_recent_data(lat, lon)
            if len(df) < 30:
                return {"error": "Not enough recent data available for prediction."}

            x = make_input_sequence(df, self.scaler)
            tensor = torch.FloatTensor(x)
            with torch.no_grad():
                output = self.model(tensor).numpy()[0]

            # Inverse transform: reconstruct full feature row for scaler.
            dummy = self.scaler.inverse_transform([[v, 0, 0] for v in output])
            temps = [round(float(d[0]), 1) for d in dummy]

            peak_day = int(temps.index(max(temps)))
            peak_temp = max(temps)
            recent_avg = float(df["temp_max"].tail(30).mean())
            anomaly = round(float(sum(temps) / len(temps)) - recent_avg, 1)
            heat_risk = compute_heat_risk(temps, HEAT_THRESHOLD)

            self.requests_served += 1
            return {
                "temps": temps,
                "peak_day": peak_day,
                "peak_temp": peak_temp,
                "heat_risk": heat_risk,
                "anomaly": anomaly,
                "forecast_days": 14,
            }
        except Exception as exc:
            logging.error(f"Prediction failed: {exc}")
            raise

    def get_metrics(self) -> dict:
        return {
            "model_loaded_at": self.model_loaded_at,
            "requests_served": self.requests_served,
            "model_path": MODEL_PATH,
            "scaler_path": SCALER_PATH,
            "is_ready": self.ready,
        }


service = InferenceService()

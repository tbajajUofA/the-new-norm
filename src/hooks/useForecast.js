import { useCallback, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function useForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchMetrics = useCallback(async () => {
    const res = await fetch(`${BACKEND_URL}/metrics`);
    if (!res.ok) throw new Error('Metrics request failed');
    return res.json();
  }, []);

  const fetchForecast = useCallback(async (lat, lon, cityName = 'Unknown city') => {
    setLoading(true);
    setError(null);

    try {
      const [forecastRes, metricsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/predict?lat=${lat}&lon=${lon}`),
        fetchMetrics().catch(() => null),
      ]);

      if (metricsRes) setMetrics(metricsRes);

      const res = forecastRes;
      if (!res.ok) {
        throw new Error('Forecast request failed');
      }

      const data = await res.json();
      setForecast(data);

      setHistory((prev) => {
        const entry = {
          id: `${cityName}-${Date.now()}`,
          cityName,
          generatedAt: new Date().toISOString(),
          peakTemp: data.peak_temp,
          heatRisk: data.heat_risk,
          anomaly: data.anomaly,
          temps: data.temps,
        };
        return [entry, ...prev].slice(0, 6);
      });
    } catch {
      setError('Unable to load forecast. Make sure the backend is running.');
      setForecast(null);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  return { forecast, loading, error, fetchForecast, metrics, history };
}

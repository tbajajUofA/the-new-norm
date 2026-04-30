import { useCallback, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function readJson(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || fallbackMessage);
  }

  return data;
}

async function readEventStream(response, onProgress) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const data = (() => {
      try {
        return text ? JSON.parse(text) : null;
      } catch {
        return null;
      }
    })();
    throw new Error(data?.detail || data?.error || 'Crossing request failed');
  }

  if (!response.body) {
    throw new Error('Streaming response is unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) {
        separatorIndex = buffer.indexOf('\n\n');
        continue;
      }

      const payload = JSON.parse(dataLine.slice(6));
      if (typeof onProgress === 'function' && payload.progress != null) {
        onProgress(payload.progress, payload.label || '');
      }

      if (payload.result) {
        finalResult = payload.result;
      }

      separatorIndex = buffer.indexOf('\n\n');
    }
  }

  return finalResult;
}

export function useForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState({ pct: 0, label: '' });

  const fetchForecast = useCallback(async (climateData, city = {}) => {
    const anomalies = climateData?.anomalyData?.map((entry) => Number(entry.anomaly)).filter(Number.isFinite) ?? [];
    const cityName = city?.name || 'Unknown city';
    const cityCountry = city?.country || '';

    if (anomalies.length < 40) {
      setError('Need at least 40 years of anomaly data for the climate forecast.');
      setForecast(null);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress({ pct: 0, label: 'Preparing Chronos forecast...' });

    try {
      const payload = { anomalies };
      const crossingRes = await fetch(`${BACKEND_URL}/api/climate/crossing/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await readEventStream(crossingRes, (pct, label) => {
        setLoadingProgress({ pct, label });
      });

      if (!result?.crossing || !result?.regime || !result?.forecast5) {
        throw new Error('Incomplete climate forecast response.');
      }

      const data = {
        crossing: result.crossing,
        regime: result.regime,
        forecast5: result.forecast5,
        cityName,
        cityCountry,
        generatedAt: new Date().toISOString(),
      };
      setLoadingProgress({ pct: 100, label: 'Complete' });
      setForecast(data);

      setHistory((prev) => {
        const entry = {
          id: `${cityName}-${Date.now()}`,
          cityName,
          cityCountry,
          generatedAt: new Date().toISOString(),
          crossingYear: data.crossing.crossingYear,
          regime: data.regime.label,
          summary: data.regime.summary,
        };
        return [entry, ...prev].slice(0, 6);
      });
    } catch {
      setError('Unable to load climate forecast. Make sure the backend is running.');
      setForecast(null);
      setLoadingProgress({ pct: 0, label: '' });
    } finally {
      setLoading(false);
    }
  }, []);

  return { forecast, loading, error, fetchForecast, history, loadingProgress };
}

import {
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import { generateClimateCard } from '../utils/climateCard';

function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatAnomaly(value) {
  const numericValue = toNumber(value) ?? 0;
  return `${numericValue >= 0 ? '+' : ''}${numericValue.toFixed(2)}°C`;
}

  export default function ForecastChart({
    city,
    forecast,
    loading,
    error,
    history = [],
    climateData = null,
    loadingProgress = { pct: 0, label: '' },
  }) {
    const [shareState, setShareState] = useState('idle');

  if (!city) return null;

  if (loading) {
      const pct = Math.max(0, Math.min(100, Number(loadingProgress?.pct ?? 0)));
      const label = loadingProgress?.label || 'AI-powered forecast in process.';

    return (
        <div className="panel-loading forecast-loading-panel">
        <div className="loading-spinner" />
          <p>{label}</p>
          <div className="forecast-loader">
            <div className="loader-track">
              <div className="loader-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="loader-row">
              <span className="loader-label">AI-powered forecast in process</span>
              <span className="loader-pct">{pct}%</span>
            </div>
          </div>
      </div>
    );
  }

  if (error) {
    return <div className="panel-error">{error}</div>;
  }

    const anomalySeries = climateData?.anomalyData ?? [];
    const crossing = forecast?.crossing ?? null;
    const regime = forecast?.regime ?? {};
    const hasForecast = Boolean(crossing && anomalySeries.length > 0);

    if (!hasForecast) {
      return (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <p>Preparing Chronos forecast for {city.name}...</p>
        </div>
      );
    }

    const crossingYear = crossing.crossingYear ?? null;
    const futureCrossingYear = crossingYear && crossingYear > 2026 ? crossingYear : null;
    const crossedByNow = crossingYear != null && crossingYear <= 2026;
    const currentAnomaly = toNumber(crossing.currentAnomaly) ?? anomalySeries.at(-1)?.anomaly ?? 0;
    const currentAnomalyLabel = formatAnomaly(currentAnomaly);
    const crossingLabel = futureCrossingYear
      ? `${city.name} is projected to cross 1.5°C by ${futureCrossingYear}.`
      : crossedByNow
        ? `${city.name} is already beyond the 1.5°C threshold as of 2026.`
        : `${city.name} does not cross 1.5°C by 2100 in the median forecast.`;
    const interpretation = regime.summary || crossingLabel;

    const historicalSlice = anomalySeries.slice(Math.max(0, anomalySeries.length - 30));
    const chartMap = new Map();

    historicalSlice.forEach((point) => {
      chartMap.set(point.year, {
        year: point.year,
        observed: point.anomaly,
        forecastMedian: null,
        forecastLow: null,
        forecastHigh: null,
      });
    });

    (crossing.forecastYears || []).forEach((year, index) => {
      const existing = chartMap.get(year) || { year, observed: null };
      chartMap.set(year, {
        ...existing,
        forecastMedian: toNumber(crossing.forecastMedian?.[index]),
        forecastLow: toNumber(crossing.forecastLow?.[index]),
        forecastHigh: toNumber(crossing.forecastHigh?.[index]),
      });
    });

    const chartData = [...chartMap.values()].sort((a, b) => a.year - b.year);
    const forecastBands = chartData.filter((point) => point.forecastLow != null && point.forecastHigh != null);

    const handleShare = async () => {
      if (!anomalySeries.length) return;

      setShareState('building');
      try {
        const imageData = await generateClimateCard({
          cityName: city.name,
          country: city.country,
          currentAnomaly,
          crossingYear,
          regime: regime.regime,
          regimeEmoji: regime.emoji,
          anomalySeries: anomalySeries.map((item) => Number(item.anomaly)),
          extremeDaysSeries: anomalySeries.map((item) => Number(item.extremeDays ?? 0)),
          extremeIncrease: climateData?.stats?.extremeIncrease ?? null,
          currentExtremeDays: climateData?.stats?.currentExtreme ?? null,
          latitude: city.latitude ?? null,
          longitude: city.longitude ?? null,
        });

        const response = await fetch(imageData);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'climate'}-card.png`;
        link.click();
        URL.revokeObjectURL(objectUrl);
        setShareState('done');
        window.setTimeout(() => setShareState('idle'), 1800);
      } catch {
        setShareState('error');
        window.setTimeout(() => setShareState('idle'), 1800);
      }
    };

  return (
    <div className="climate-panel">
      <div className="forecast-header-row">
        <div>
          <h3 className="chart-title">Chronos AI Climate Outlook</h3>
          <p className="chart-subtitle">Annual anomaly forecast from the historical climate series.</p>
            <p className="forecast-meta">{city.name}{city.country ? `, ${city.country}` : ''}</p>
        </div>
          <div className="forecast-actions">
            <button className="share-btn" type="button" onClick={handleShare}>
              {shareState === 'building' ? 'Building card...' : shareState === 'done' ? 'Card saved' : 'Share climate card'}
            </button>
          </div>
      </div>
      <div className="outlook-keyline">
        <p className="chart-interpretation primary">{crossingLabel}</p>
        {regime.label && (
          <span className={`status-badge ${regime.regime || 'stable'} inline-pill`}>
            {regime.emoji ? `${regime.emoji} ` : ''}{regime.label}
          </span>
        )}
      </div>
      <p className="chart-interpretation regime-line">{interpretation}</p>

      <div className="paris-threshold-help" role="note" aria-label="Paris threshold explanation">
        <span>Paris threshold</span>
        <button type="button" className="paris-tooltip-trigger" aria-label="What is the Paris threshold?">
          ?
          <span className="paris-tooltip-content">
            1.5°C is the Paris Agreement warming limit above pre-industrial levels, used as a critical climate risk guardrail.
          </span>
        </button>
      </div>

      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 8, right: 32, bottom: 20, left: 0 }}>
            <XAxis
              dataKey="year"
              tickFormatter={(value) => String(value)}
              tick={{ fill: '#4a6280', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              type="number"
              domain={[chartData[0]?.year ?? 1950, chartData.at(-1)?.year ?? 2100]}
              tickCount={8}
            />
            <YAxis
              tick={{ fill: '#4a6280', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: '#132338',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                color: '#e2e8f0',
                fontFamily: 'IBM Plex Mono, monospace',
                maxWidth: 'min(320px, 82vw)',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)}°C`,
                name === 'observed' ? 'Observed anomaly' : name === 'forecastMedian' ? 'Forecast median' : name === 'forecastLow' ? 'Forecast low' : 'Forecast high',
              ]}
              labelFormatter={(value) => `Year ${value}`}
            />
            <ReferenceLine
              y={1.5}
              stroke="#f59e0b"
              strokeDasharray="6 6"
              label={{ value: 'Paris threshold', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }}
            />
            {forecastBands.map((area) => (
              <ReferenceArea
                key={area.year}
                x1={area.year - 0.45}
                x2={area.year + 0.45}
                y1={area.forecastLow}
                y2={area.forecastHigh}
                fill="rgba(239,68,68,0.12)"
                strokeOpacity={0}
                ifOverflow="extendDomain"
              />
            ))}
            <Line type="monotone" dataKey="observed" stroke="#fb7185" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="forecastLow" stroke="#fca5a5" strokeWidth={1.2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
            <Line type="monotone" dataKey="forecastMedian" stroke="#ef4444" strokeWidth={2.5} dot={false} strokeDasharray="6 4" isAnimationActive={false} />
            <Line type="monotone" dataKey="forecastHigh" stroke="#fca5a5" strokeWidth={1.2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-subtitle">Confidence band widens further out in time. Uncertainty increases with forecast distance.</p>

      <div className="model-explainer compact">
        <h4>How Chronos works</h4>
        <p>
          Chronos reads the city&apos;s yearly anomaly history and forecasts the next 76 years of warming.
          The band shows uncertainty, the median line shows the central estimate, and the 1.5°C threshold marks the Paris target.
          {' '}
          <a href="https://huggingface.co/amazon/chronos-t5-large" target="_blank" rel="noreferrer" className="model-link">
            Model: Amazon Chronos
          </a>
        </p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Projected crossing year</div>
          <div className="stat-value hot">{futureCrossingYear ?? (crossedByNow ? 'Already crossed' : 'Not reached')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current anomaly</div>
          <div className="stat-value">{currentAnomalyLabel}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Acceleration</div>
          <div className="stat-value">{typeof regime.acceleration === 'number' ? `${regime.acceleration.toFixed(3)}°C/yr` : 'n/a'}</div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Climate Snapshots</h3>
            <p className="chart-subtitle">Recent city runs in this session for quick comparison</p>
          </div>

          <div className="snapshot-list">
            {history.map((item) => (
              <div key={item.id} className="snapshot-card">
                <span className="snapshot-city">{item.cityName}</span>
                <span className="snapshot-time">{formatClock(item.generatedAt)}</span>
                <span className="snapshot-line">Crossing {item.crossingYear ?? 'not reached'}</span>
                <span className="snapshot-line">Regime {item.regime}</span>
                <span className="snapshot-line">{item.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

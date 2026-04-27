import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatTickDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatFullDate(iso) {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatus(metrics) {
  if (!metrics) {
    return {
      label: 'API unavailable',
      className: 'status-badge offline',
      detail: 'No metrics response from backend',
    };
  }

  if (metrics.is_ready) {
    return {
      label: 'Model ready',
      className: 'status-badge ready',
      detail: metrics.model_loaded_at
        ? `Loaded ${new Date(metrics.model_loaded_at).toLocaleString()}`
        : 'Loaded recently',
    };
  }

  return {
    label: 'Model not loaded',
    className: 'status-badge warming',
    detail: 'Train model artifacts before forecasting',
  };
}

export default function ForecastChart({ city, forecast, loading, error, metrics, history = [], climateData = null }) {
  if (!city) return null;

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner" />
        <p>Loading forecast...</p>
      </div>
    );
  }

  if (error) {
    return <div className="panel-error">{error}</div>;
  }

  if (!forecast) return null;

  const status = getStatus(metrics);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const chartData = (forecast.temps || []).map((temp, i) => ({
    date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i).toISOString(),
    temp,
    index: i,
    band: [
      Number((temp - (1 + i * 0.18 + forecast.heat_risk * 1.2)).toFixed(1)),
      Number((temp + (1 + i * 0.18 + forecast.heat_risk * 1.2)).toFixed(1)),
    ],
  }));

  const peakDay = typeof forecast.peak_day === 'number' ? forecast.peak_day : -1;
  const anomalyValue = Number(forecast.anomaly || 0);
  const anomalyLabel = `${anomalyValue >= 0 ? '+' : ''}${anomalyValue}°C`;
  const peakDate = chartData[peakDay]?.date;
  const interpretation = peakDate
    ? `Interpretation: The model projects the hottest point around ${formatFullDate(peakDate)} at ${forecast.peak_temp}°C, with a heat risk of ${(forecast.heat_risk * 100).toFixed(0)}% over the next two weeks.`
    : `Interpretation: The model points to elevated heat pressure over the next two weeks, with risk concentrated toward the latter half of the window.`;

  return (
    <div className="climate-panel">
      <div className="forecast-header-row">
        <h3 className="chart-title">14-Day Forecast</h3>
      </div>
      <p className="chart-subtitle">
        {city.name}: peak {forecast.peak_temp}°C, heat risk {(forecast.heat_risk * 100).toFixed(0)}%
      </p>

      <div className="model-explainer">
        <h4>How the Transformer forecast works</h4>
        <p>
          We use a Transformer time-series model that reads the most recent 30 days of local temperature signals
          (max, min, mean) and predicts the next 14 daily maximum temperatures. Heat risk and anomaly are then
          derived from those predicted values.
        </p>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 8, right: 32, bottom: 20, left: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={formatTickDate}
              tick={{ fill: '#4a6280', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              minTickGap={24}
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
              formatter={(value, name) => {
                if (name === 'band') {
                  return [`${value[0]}°C to ${value[1]}°C`, 'Confidence band'];
                }
                return [`${value}°C`, 'Temperature'];
              }}
              labelFormatter={(value) => formatFullDate(value)}
            />
            <Area
              type="monotone"
              dataKey="band"
              stroke="none"
              fill="rgba(239,68,68,0.16)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {/* Removed static peak marker to avoid a non-moving dot; activeDot on hover remains */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-subtitle">
        Confidence band widens further out in time. Uncertainty increases with forecast distance.
      </p>
      <p className="chart-interpretation">{interpretation}</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Peak Temp</div>
          <div className="stat-value hot">{forecast.peak_temp}°C</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Heat Risk</div>
          <div className="stat-value">{(forecast.heat_risk * 100).toFixed(0)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Anomaly vs recent</div>
          <div className="stat-value">{anomalyLabel}</div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Forecast Snapshots</h3>
            <p className="chart-subtitle">Recent model runs in this session for quick comparison</p>
          </div>

          <div className="snapshot-list">
            {history.map((item) => (
              <div key={item.id} className="snapshot-card">
                <span className="snapshot-city">{item.cityName}</span>
                <span className="snapshot-time">{formatClock(item.generatedAt)}</span>
                <span className="snapshot-line">Peak {item.peakTemp}°C</span>
                <span className="snapshot-line">Risk {(item.heatRisk * 100).toFixed(0)}%</span>
                <span className="snapshot-line">
                  Anomaly {item.anomaly >= 0 ? '+' : ''}
                  {item.anomaly}°C
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* 5-Year Outlook Panel (trend projection) */}
          {climateData && climateData.anomalyData && climateData.anomalyData.length > 10 && (
            <div className="chart-card full-width outlook-card" style={{ marginTop: 18 }}>
              <div className="chart-header">
                <h3 className="chart-title">5-Year Climate Outlook (Trend Projection)</h3>
                <p className="chart-subtitle">A statistical extrapolation of the recent historical trend, not Transformer output.</p>
              </div>

              {(() => {
                const series = climateData.anomalyData.map((d) => ({ year: Number(d.year), avgTemp: Number(d.avgTemp) }));
                const n = series.length;
                // center years to improve numeric stability
                const years = series.map(s => s.year);
                const meanX = years.reduce((a,b)=>a+b,0)/n;
                const meanY = series.reduce((a,b)=>a+b.avgTemp,0)/n;
                let num = 0, den = 0;
                for (let i = 0; i < n; i++) {
                  const x = series[i].year - meanX;
                  const y = series[i].avgTemp - meanY;
                  num += x * y;
                  den += x * x;
                }
                const m = den !== 0 ? num / den : 0;
                const b = meanY - m * meanX;

                const lastYear = series[series.length - 1].year;
                const projection = [];
                for (let i = 1; i <= 5; i++) {
                  const yr = lastYear + i;
                  const pred = m * yr + b;
                  projection.push({ year: yr, projTemp: Number(pred.toFixed(2)) });
                }

                const histWindow = Math.min(30, series.length);
                const histSlice = series.slice(Math.max(0, series.length - histWindow));

                const chartDataOutlook = [];
                histSlice.forEach((d) => chartDataOutlook.push({ year: d.year, observed: Number(d.avgTemp.toFixed(2)) }));
                projection.forEach((p) => chartDataOutlook.push({ year: p.year, projected: p.projTemp }));

                const ProjectDot = (props) => {
                  const { cx, cy, payload } = props;
                  if (!payload || payload.projected === undefined) return null;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#f97316" strokeWidth={2} />
                    </g>
                  );
                };

                return (
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={chartDataOutlook} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#f1f5f9', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                          tickLine={false}
                          type="number"
                          domain={['dataMin', 'dataMax']}
                          tickFormatter={(v) => String(v)}
                        />
                        <YAxis
                          tick={{ fill: '#f1f5f9', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                          tickLine={false}
                          width={64}
                          domain={[ 'auto', 'auto' ]}
                        />
                        <Tooltip
                          contentStyle={{ background: '#0f1724', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontFamily: 'IBM Plex Mono, monospace' }}
                          formatter={(value, name) => [`${value}°C`, name === 'projected' ? 'Projected' : 'Observed']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Line type="monotone" dataKey="observed" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                        <Area type="monotone" dataKey="observed" fill="rgba(251,113,133,0.08)" stroke="none" isAnimationActive={false} />
                        <Line
                          type="monotone"
                          dataKey="projected"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={ProjectDot}
                          strokeDasharray="6 6"
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              <p className="chart-interpretation" style={{ marginTop: 10 }}>
                This long-range panel is a statistical trend projection from historical observations, not direct Transformer inference.
              </p>
            </div>
          )}
    </div>
  );
}

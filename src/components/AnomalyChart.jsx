import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-year">{label}</p>
      <p className="tooltip-value" style={{ color: v >= 0 ? '#ef4444' : '#94a3b8' }}>
        {v >= 0 ? '+' : ''}{v}°C
      </p>
    </div>
  );
};

export default function AnomalyChart({ data }) {
  const latest = data[data.length - 1];
  const first = data[0];
  const delta = Number((latest.anomaly - first.anomaly).toFixed(2));
  const direction = delta >= 0 ? 'upward' : 'downward';

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Temperature Anomaly</h3>
        <p className="chart-subtitle">
          Annual deviation from 1951 to 1980 baseline (°C), red = warmer, muted tones = cooler
        </p>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#4a6280', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            interval={9}
          />
          <YAxis
            tick={{ fill: '#4a6280', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}°`}
          />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Bar dataKey="anomaly" maxBarSize={12} radius={[2, 2, 0, 0]}>
            {data.map((d, i) => {
              const intensity = Math.min(0.35 + Math.abs(d.anomaly) * 0.28, 1);
              return (
                <Cell
                  key={i}
                  fill={d.anomaly >= 0
                    ? `rgba(239,68,68,${intensity})`
                    : `rgba(148,163,184,${Math.max(intensity - 0.2, 0.22)})`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-interpretation">
        Interpretation: From {first.year} to {latest.year}, anomaly shifted {delta >= 0 ? '+' : ''}
        {delta}°C, indicating a long-term {direction} drift relative to the baseline.
      </p>
    </div>
  );
}
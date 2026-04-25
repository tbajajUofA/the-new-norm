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
      <p className="tooltip-value" style={{ color: v >= 0 ? '#ef4444' : '#60a5fa' }}>
        {v >= 0 ? '+' : ''}{v}°C
      </p>
    </div>
  );
};

export default function AnomalyChart({ data }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Temperature Anomaly</h3>
        <p className="chart-subtitle">
          Annual deviation from 1951–1980 baseline (°C) — red = warmer, blue = cooler
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
                    : `rgba(96,165,250,${intensity})`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
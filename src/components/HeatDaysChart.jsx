import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// 10-year centered moving average
function withMovingAvg(data) {
  return data.map((d, i, arr) => {
    const window = arr.slice(Math.max(0, i - 4), Math.min(arr.length, i + 5));
    const avg = window.reduce((s, w) => s + w.extremeDays, 0) / window.length;
    return { ...d, trend: parseFloat(avg.toFixed(1)) };
  });
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const days  = payload.find(p => p.dataKey === 'extremeDays')?.value;
  const trend = payload.find(p => p.dataKey === 'trend')?.value;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-year">{label}</p>
      {days  != null && <p className="tooltip-value" style={{ color: '#ef4444' }}>{days} days</p>}
      {trend != null && <p className="tooltip-value" style={{ color: '#f97316', fontSize: 11 }}>10-yr avg: {trend}</p>}
    </div>
  );
};

export default function HeatDaysChart({ data, threshold }) {
  const enriched = withMovingAvg(data);
  const earlyYears = enriched.slice(0, 10);
  const recentYears = enriched.slice(-10);
  const avg = (arr) => arr.reduce((sum, item) => sum + item.extremeDays, 0) / Math.max(arr.length, 1);
  const earlyAvg = avg(earlyYears);
  const recentAvg = avg(recentYears);
  const change = Number((recentAvg - earlyAvg).toFixed(1));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Extreme Heat Days / Year</h3>
        <p className="chart-subtitle">
          Days exceeding 90th-pct baseline ({threshold}°C), orange line = 10 year trend
        </p>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={enriched} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
            </linearGradient>
          </defs>
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
          />
          <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="extremeDays"
            stroke="#ef4444"
            strokeWidth={1.5}
            fill="url(#heatGrad)"
            dot={false}
            activeDot={{ r: 3, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
        <p className="chart-interpretation">
        Interpretation: Recent decades are averaging {change >= 0 ? '+' : ''}{change} more extreme heat days per year than the earliest decade in this record, signaling stronger heat persistence.
      </p>
    </div>
  );
}
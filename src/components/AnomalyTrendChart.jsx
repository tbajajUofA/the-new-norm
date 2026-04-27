import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function rollingAvg(data, windowSize) {
  const radius = Math.floor(windowSize / 2);
  return data.map((d, i, arr) => {
    const start = Math.max(0, i - radius);
    const end = Math.min(arr.length, i + radius + 1);
    const segment = arr.slice(start, end);
    const avg = segment.reduce((sum, item) => sum + item.anomaly, 0) / segment.length;
    return Number(avg.toFixed(2));
  });
}

function toTrendSeries(data) {
  const avg5 = rollingAvg(data, 5);
  const avg10 = rollingAvg(data, 10);
  const avg30 = rollingAvg(data, 30);

  return data.map((d, i) => ({
    year: d.year,
    avg5: avg5[i],
    avg10: avg10[i],
    avg30: avg30[i],
  }));
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="tooltip-year">{label}</p>
      {payload.map((row) => (
        <p key={row.dataKey} className="tooltip-value" style={{ color: row.color, fontSize: 11 }}>
          {row.name}: {row.value > 0 ? '+' : ''}
          {row.value}°C
        </p>
      ))}
    </div>
  );
};

export default function AnomalyTrendChart({ data }) {
  const trendSeries = toTrendSeries(data);
  const first = trendSeries[0];
  const latest = trendSeries[trendSeries.length - 1];
  const drift = Number((latest.avg30 - first.avg30).toFixed(2));

  return (
    <div className="chart-card full-width">
      <div className="chart-header">
        <h3 className="chart-title">Multi-Scale Warming Trend</h3>
        <p className="chart-subtitle">
          Rolling anomaly averages: 5-year pulse, 10-year signal, 30-year climate drift
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={trendSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
            tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}°`}
          />
          <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
          <Line type="monotone" dataKey="avg5" name="5-yr" stroke="#fb7185" strokeWidth={1.6} dot={false} />
          <Line type="monotone" dataKey="avg10" name="10-yr" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="avg30" name="30-yr" stroke="#b91c1c" strokeWidth={2.2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-interpretation">
        Interpretation: The 30-year signal moved {drift >= 0 ? '+' : ''}{drift}°C from the start to the end of the record, showing persistent structural warming rather than short-lived variability.
      </p>
    </div>
  );
}

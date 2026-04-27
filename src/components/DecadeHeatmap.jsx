function buildDecadeGrid(data) {
  const decades = [];
  for (let decade = 1950; decade <= 2020; decade += 10) {
    const years = [];
    for (let offset = 0; offset < 10; offset += 1) {
      const year = decade + offset;
      const match = data.find((item) => item.year === year);
      if (!match) continue;
      years.push({
        year,
        anomaly: match.anomaly,
        extremeDays: match.extremeDays,
      });
    }
    decades.push({ decade, years });
  }
  return decades;
}

function getIntensity(value, maxValue) {
  if (maxValue <= 0) return 0.12;
  const scaled = value / maxValue;
  return Math.min(0.2 + scaled * 0.75, 0.95);
}

export default function DecadeHeatmap({ data }) {
  const grid = buildDecadeGrid(data);
  const maxExtremeDays = Math.max(...data.map((d) => d.extremeDays), 1);
  const hottestDecade = grid
    .map((row) => {
      const avg = row.years.reduce((sum, y) => sum + y.extremeDays, 0) / Math.max(row.years.length, 1);
      return { decade: row.decade, avg: Number(avg.toFixed(1)) };
    })
    .sort((a, b) => b.avg - a.avg)[0];

  return (
    <div className="chart-card full-width">
      <div className="chart-header">
        <h3 className="chart-title">Decade Heat Intensity Map</h3>
        <p className="chart-subtitle">
          Each cell is a year. Darker red means more extreme heat days in that year.
        </p>
      </div>

      <div className="heatmap-grid">
        {grid.map((row) => (
          <div key={row.decade} className="heatmap-row">
            <span className="heatmap-decade">{row.decade}s</span>
            <div className="heatmap-cells">
              {row.years.map((cell) => {
                const alpha = getIntensity(cell.extremeDays, maxExtremeDays);
                const tone = `rgba(239,68,68,${Math.max(alpha - 0.05, 0.16)})`;
                return (
                  <div
                    key={cell.year}
                    className="heatmap-cell"
                    style={{ background: tone }}
                    title={`${cell.year}: ${cell.extremeDays} extreme days, anomaly ${cell.anomaly > 0 ? '+' : ''}${cell.anomaly}°C`}
                  >
                    <span>{String(cell.year).slice(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="chart-interpretation">
        Interpretation: The {hottestDecade.decade}s emerge as the highest-intensity decade on average ({hottestDecade.avg} extreme days/year), showing how risk is concentrating in recent eras.
      </p>
    </div>
  );
}

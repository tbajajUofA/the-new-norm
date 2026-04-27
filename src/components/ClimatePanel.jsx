import AnomalyChart from './AnomalyChart';
import HeatDaysChart from './HeatDaysChart';
import AnomalyTrendChart from './AnomalyTrendChart';
import DecadeHeatmap from './DecadeHeatmap';

export default function ClimatePanel({ city, climateData, loading, error }) {
  if (loading) {
    return (
      <div className="panel-loading">
        <div className="loading-spinner" />
        <p>Fetching 70+ years of climate data…</p>
      </div>
    );
  }

  if (error) {
    return <div className="panel-error">Error: {error}</div>;
  }

  if (!climateData || !city) return null;

  const { anomalyData, extremeThreshold, stats, baselineAvg } = climateData;
  const {
    recentAnomaly, hottestYear, hottestAnomaly,
    extremeIncrease, currentExtreme,
  } = stats;

  const anomalySign = recentAnomaly >= 0 ? '+' : '';
  const hottestSign = hottestAnomaly >= 0 ? '+' : '';

  // Build insight sentence
  const insightParts = [];
  if (recentAnomaly >= 0.5)
    insightParts.push(`<strong>${city.name}</strong> has averaged <strong>${anomalySign}${recentAnomaly}°C</strong> above the 1951 to 1980 baseline over the past decade`);
  if (extremeIncrease > 10)
    insightParts.push(`extreme heat days have increased by <strong>${extremeIncrease}%</strong> compared to the 1960s`);
  if (hottestYear >= 2010)
    insightParts.push(`the hottest year on record was <strong>${hottestYear}</strong> (${hottestSign}${hottestAnomaly}°C)`);

  const insight = insightParts.join(', and ');

  return (
    <div className="climate-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <h2 className="panel-city">{city.name}</h2>
        </div>
        <div className="panel-meta">
          <p className="panel-coords">
            {Math.abs(city.latitude).toFixed(2)}°{city.latitude >= 0 ? 'N' : 'S'}&nbsp;&nbsp;
            {Math.abs(city.longitude).toFixed(2)}°{city.longitude >= 0 ? 'E' : 'W'}
          </p>
          <p className="panel-baseline">
            Baseline avg: {baselineAvg}°C (1951 to 1980)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className={`stat-value ${recentAnomaly > 0.5 ? 'hot' : recentAnomaly > 0 ? 'warm' : 'cool'}`}>
            {anomalySign}{recentAnomaly}°C
          </span>
          <span className="stat-label">Avg anomaly 2015 to 2024 vs baseline</span>
        </div>
        <div className="stat-card">
          <span className="stat-value hot">{hottestYear}</span>
          <span className="stat-label">
            Hottest year on record ({hottestSign}{hottestAnomaly}°C)
          </span>
        </div>
        <div className="stat-card">
          <span className={`stat-value ${extremeIncrease > 0 ? 'hot' : 'cool'}`}>
            {extremeIncrease > 0 ? '+' : ''}{extremeIncrease}%
          </span>
          <span className="stat-label">Change in extreme heat days vs 1960s</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{currentExtreme}</span>
          <span className="stat-label">Extreme heat days in 2024 (&gt;{extremeThreshold}°C)</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <AnomalyChart data={anomalyData} />
        <HeatDaysChart data={anomalyData} threshold={extremeThreshold} />
        <AnomalyTrendChart data={anomalyData} />
        <DecadeHeatmap data={anomalyData} />
      </div>

      {/* Insight bar */}
      {insight && (
        <div
          className="insight-bar"
          dangerouslySetInnerHTML={{ __html: `${insight}.` }}
        />
      )}
    </div>
  );
}
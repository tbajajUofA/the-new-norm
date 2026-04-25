import { useState, useCallback } from 'react';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const ARCHIVE_URL   = 'https://archive-api.open-meteo.com/v1/archive';

export function useClimateData() {
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [cityData,    setCityData]    = useState(null);
  const [climateData, setClimateData] = useState(null);

  const searchCity = useCallback(async (query) => {
    const res  = await fetch(`${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  }, []);

  const fetchClimateData = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    setClimateData(null);
    setCityData(city);

    try {
      const { latitude, longitude } = city;
      const res = await fetch(
        `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}` +
        `&start_date=1950-01-01&end_date=2024-12-31` +
        `&daily=temperature_2m_max,temperature_2m_min&timezone=UTC`
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();

      if (!json.daily) throw new Error('No climate data available for this location.');
      const processed = processClimateData(json.daily);
      setClimateData(processed);
    } catch (err) {
      setError(err.message || 'Failed to load climate data.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, cityData, climateData, searchCity, fetchClimateData };
}

/* ─── Data processing ──────────────────────────────────────────────────── */

function processClimateData({ time, temperature_2m_max, temperature_2m_min }) {
  // 1. Build daily records, drop nulls
  const daily = time.reduce((acc, date, i) => {
    const mx = temperature_2m_max[i];
    const mn = temperature_2m_min[i];
    if (mx == null || mn == null || isNaN(mx) || isNaN(mn)) return acc;
    acc.push({ year: parseInt(date.slice(0, 4)), mean: (mx + mn) / 2, max: mx });
    return acc;
  }, []);

  // 2. Aggregate by year
  const byYear = {};
  daily.forEach(({ year, mean, max }) => {
    if (!byYear[year]) byYear[year] = { means: [], maxes: [] };
    byYear[year].means.push(mean);
    byYear[year].maxes.push(max);
  });

  const yearlyData = Object.entries(byYear)
    .filter(([y]) => +y >= 1950 && +y <= 2024)
    .map(([y, { means, maxes }]) => ({
      year: +y,
      avgTemp: means.reduce((s, v) => s + v, 0) / means.length,
      maxes,
    }))
    .sort((a, b) => a.year - b.year);

  // 3. Baseline 1951–1980 average annual temp
  const baselineYears = yearlyData.filter(d => d.year >= 1951 && d.year <= 1980);
  const baselineAvg   = baselineYears.reduce((s, d) => s + d.avgTemp, 0) / baselineYears.length;

  // 4. 90th-percentile daily max from baseline period → "extreme heat" threshold
  const baselineMaxes = baselineYears.flatMap(d => d.maxes).sort((a, b) => a - b);
  const p90 = baselineMaxes[Math.floor(baselineMaxes.length * 0.9)];

  // 5. Build anomaly + extreme-days series
  const anomalyData = yearlyData.map(d => ({
    year: d.year,
    anomaly:     parseFloat((d.avgTemp - baselineAvg).toFixed(2)),
    avgTemp:     parseFloat(d.avgTemp.toFixed(2)),
    extremeDays: d.maxes.filter(m => m > p90).length,
  }));

  // 6. Decade comparison for extreme days
  const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const decadeExtreme = decade =>
    mean(anomalyData.filter(d => d.year >= decade && d.year < decade + 10).map(d => d.extremeDays));

  const extreme1960s = decadeExtreme(1960);
  const extreme2010s = decadeExtreme(2015); // 2015–2024
  const extremePct   = extreme1960s > 0
    ? Math.round((extreme2010s - extreme1960s) / extreme1960s * 100)
    : 0;

  // 7. Summary stats
  const recentSlice   = anomalyData.filter(d => d.year >= 2015);
  const hottest       = [...anomalyData].sort((a, b) => b.anomaly - a.anomaly)[0];
  const recentAnomaly = mean(recentSlice.map(d => d.anomaly));

  return {
    anomalyData,
    baselineAvg:      parseFloat(baselineAvg.toFixed(2)),
    extremeThreshold: parseFloat(p90.toFixed(1)),
    stats: {
      hottestYear:      hottest.year,
      hottestAnomaly:   hottest.anomaly,
      recentAnomaly:    parseFloat(recentAnomaly.toFixed(2)),
      extremeIncrease:  extremePct,
      currentExtreme:   recentSlice.at(-1)?.extremeDays ?? 0,
    },
  };
}
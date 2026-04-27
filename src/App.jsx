import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import SearchBar      from './components/SearchBar';
import ClimatePanel   from './components/ClimatePanel';
import { useClimateData } from './hooks/useClimateData';
import { useForecast } from './hooks/useForecast';
import ForecastChart from './components/ForecastChart';

const GlobeComponent = lazy(() => import('./components/Globe'));

export default function App() {
  const { loading, error, cityData, climateData, fetchClimateData } = useClimateData();
  const {
    forecast,
    loading: forecastLoading,
    error: forecastError,
    fetchForecast,
    metrics,
    history,
  } = useForecast();
  const [minBootElapsed, setMinBootElapsed] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [hideBootScreen, setHideBootScreen] = useState(false);
  const dataSectionRef = useRef(null);

  useEffect(() => {
    const minHold = setTimeout(() => setMinBootElapsed(true), 900);
    const maxHold = setTimeout(() => setHideBootScreen(true), 3200);
    return () => {
      clearTimeout(minHold);
      clearTimeout(maxHold);
    };
  }, []);

  useEffect(() => {
    if (minBootElapsed && globeReady) {
      setHideBootScreen(true);
    }
  }, [minBootElapsed, globeReady]);

  useEffect(() => {
    if (!climateData || !dataSectionRef.current) return;
    dataSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [climateData]);

  const handleCitySelect = useCallback((city) => {
    fetchClimateData(city);
    fetchForecast(city.latitude, city.longitude, city.name);
  }, [fetchClimateData, fetchForecast]);

  return (
    <div className="app">
      {!hideBootScreen && (
        <div className="boot-screen">
          <div className="boot-pulse" />
          <h1 className="boot-title">THE NEW NORMAL</h1>
          <p className="boot-subtitle">Loading climate data</p>
        </div>
      )}

      {/* ── Header ─────────────────────────────── */}
      <header className="app-header">
        <div className="logo-area">
          <span className="logo-dot" />
          <span className="logo-text">The New Normal</span>
        </div>
        <div className="header-search">
          <SearchBar onCitySelect={handleCitySelect} />
        </div>
        <p className="header-tagline">70+ years of climate data and ML forecast signals</p>
      </header>

      {/* ── Globe ───────────────────────────────── */}
      <div className="globe-section">
        <Suspense
          fallback={(
            <div className="globe-loading-screen">
              <div className="loading-spinner" />
              <p>Rendering atmospheric scene...</p>
            </div>
          )}
        >
          <GlobeComponent selectedCity={cityData} onReady={() => setGlobeReady(true)} />
        </Suspense>
        <div className="globe-fade-bottom" />
      </div>

      {/* ── Prompt or Data Panel ────────────────── */}
      {!cityData && !loading && (
        <p className="prompt-text">
          Search from the top bar, press Enter, and jump straight into your city's heat signature.
        </p>
      )}

      <section ref={dataSectionRef} className="data-section">
        <ClimatePanel
          city={cityData}
          climateData={climateData}
          loading={loading}
          error={error}
        />

        <ForecastChart
          city={cityData}
          forecast={forecast}
          loading={forecastLoading}
          error={forecastError}
          metrics={metrics}
          history={history}
          climateData={climateData}
        />
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h3 className="cta-title">Turn Climate Data Into Climate Action</h3>
          <p className="cta-copy">
            Share your city&apos;s results with friends, schools, and local leaders. The more people
            see local heat trends, the easier it is to build momentum for preparedness and emissions cuts.
          </p>
          <div className="cta-links">
            <a
              className="cta-link"
              href="https://350.org"
              target="_blank"
              rel="noreferrer"
            >
              Join Climate Campaigns
            </a>
            <a
              className="cta-link ghost"
              href="https://www.ipcc.ch"
              target="_blank"
              rel="noreferrer"
            >
              Learn From IPCC Reports
            </a>
          </div>
        </div>
      </section>

      <footer className="data-footer">
        <p>
          Data sources:
          {' '}
          <a href="https://archive-api.open-meteo.com" target="_blank" rel="noreferrer">
            Open-Meteo Historical Archive API
          </a>
          {' '}and{' '}
          <a href="https://geocoding-api.open-meteo.com" target="_blank" rel="noreferrer">
            Open-Meteo Geocoding API
          </a>
          . Historical baseline relies on ERA5 reanalysis from ECMWF.
        </p>
      </footer>
    </div>
  );
}
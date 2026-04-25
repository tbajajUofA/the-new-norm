import { useCallback } from 'react';
import GlobeComponent from './components/Globe';
import SearchBar      from './components/SearchBar';
import ClimatePanel   from './components/ClimatePanel';
import { useClimateData } from './hooks/useClimateData';

export default function App() {
  const { loading, error, cityData, climateData, fetchClimateData } = useClimateData();

  const handleCitySelect = useCallback((city) => {
    fetchClimateData(city);
  }, [fetchClimateData]);

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────── */}
      <header className="app-header">
        <div className="logo-area">
          <span className="logo-dot" />
          <span className="logo-text">The New Normal</span>
        </div>
        <p className="header-tagline">70+ years of climate data · any city on Earth</p>
      </header>

      {/* ── Globe + Search ──────────────────────── */}
      <div className="globe-section">
        <GlobeComponent selectedCity={cityData} />
        <div className="globe-fade-bottom" />
        <div className="search-overlay">
          <SearchBar onCitySelect={handleCitySelect} />
        </div>
      </div>

      {/* ── Prompt or Data Panel ────────────────── */}
      {!cityData && !loading && (
        <p className="prompt-text">
          ↑ spin the globe · search your city · see if the weather is getting crazier
        </p>
      )}

      <ClimatePanel
        city={cityData}
        climateData={climateData}
        loading={loading}
        error={error}
      />
    </div>
  );
}
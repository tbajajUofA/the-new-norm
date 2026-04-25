import { useState, useEffect, useRef } from 'react';

const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';

export default function SearchBar({ onCitySelect }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const debounce  = useRef(null);
  const wrapperRef = useRef(null);

  // Debounced geocoding
  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${GEOCODING}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 380);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = city => {
    setQuery(`${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}`);
    setResults([]);
    setOpen(false);
    onCitySelect(city);
  };

  return (
    <div className="search-container" ref={wrapperRef}>
      <div className="search-wrapper">
        <svg className="search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search any city on Earth…"
          className="search-input"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <span className="search-spinner" />}
      </div>

      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map(city => (
            <li
              key={city.id}
              className="search-result-item"
              onMouseDown={() => handleSelect(city)}
            >
              <span className="city-name">{city.name}</span>
              <span className="city-meta">
                {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
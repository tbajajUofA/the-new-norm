import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import Globe from 'react-globe.gl';

const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

const REGION_LABELS = [
  { text: 'North America', lat: 47, lng: -102, kind: 'region' },
  { text: 'South America', lat: -16, lng: -60, kind: 'region' },
  { text: 'Europe', lat: 52, lng: 13, kind: 'region' },
  { text: 'Africa', lat: 7, lng: 20, kind: 'region' },
  { text: 'Asia', lat: 35, lng: 95, kind: 'region' },
  { text: 'Australia', lat: -25, lng: 134, kind: 'region' },
];

export default function GlobeComponent({ selectedCity, onReady }) {
  const globeRef     = useRef();
  const containerRef = useRef();
  const [size,  setSize]  = useState({ width: 800, height: 600 });
  const [rings, setRings] = useState([]);
  const [ready, setReady] = useState(false);
  const [countries, setCountries] = useState([]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ width: el.offsetWidth, height: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        const res = await fetch(COUNTRIES_GEOJSON_URL);
        const geo = await res.json();
        if (!cancelled) {
          setCountries(Array.isArray(geo.features) ? geo.features : []);
        }
      } catch {
        if (!cancelled) {
          setCountries([]);
        }
      }
    }

    loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  // Globe ready — set up auto-rotate and default POV (Canada)
  const handleReady = useCallback(() => {
    if (!globeRef.current) return;

    const material = globeRef.current.globeMaterial();
    material.color = new THREE.Color('#111827');
    material.emissive = new THREE.Color('#470909');
    material.emissiveIntensity = 0.45;
    material.shininess = 0.7;

    const ctrl = globeRef.current.controls();
    ctrl.autoRotate      = true;
    ctrl.autoRotateSpeed = 0.35;
    ctrl.enableDamping   = true;
    ctrl.dampingFactor   = 0.1;
    ctrl.minDistance     = 150;
    ctrl.maxDistance     = 700;
    globeRef.current.pointOfView({ lat: 56, lng: -96, altitude: 2.2 });
    setReady(true);
    onReady?.();
  }, [onReady]);

  // Spin to selected city
  useEffect(() => {
    if (!selectedCity || !globeRef.current || !ready) return;
    const { latitude: lat, longitude: lng } = selectedCity;

    const ctrl = globeRef.current.controls();
    ctrl.autoRotate = false;

    globeRef.current.pointOfView({ lat, lng, altitude: 1.6 }, 1400);

    // Pulse rings for 4s
    setRings([{ lat, lng }]);
    const t = setTimeout(() => setRings([]), 4500);
    return () => clearTimeout(t);
  }, [selectedCity, ready]);

  const markerData = selectedCity
    ? [{ lat: selectedCity.latitude, lng: selectedCity.longitude }]
    : [];

  const labelsData = selectedCity
    ? [
      ...REGION_LABELS,
      {
        text: selectedCity.name,
        lat: selectedCity.latitude,
        lng: selectedCity.longitude,
        kind: 'city',
      },
    ]
    : REGION_LABELS;

  return (
    <div ref={containerRef} className="globe-container">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        onGlobeReady={handleReady}
        backgroundColor="rgba(0,0,0,0)"
        showGraticules
        polygonsData={countries}
        polygonCapColor={() => 'rgba(239,68,68,0.10)'}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={() => 'rgba(248,113,113,0.58)'}
        polygonAltitude={0.004}
        polygonsTransitionDuration={300}
        /* Atmosphere */
        atmosphereColor="#ef4444"
        atmosphereAltitude={0.22}
        /* Marker dot */
        pointsData={markerData}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#ef4444'}
        pointAltitude={0.025}
        pointRadius={0.55}
        /* Pulse rings */
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => t => `rgba(239,68,68,${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={900}
        labelsData={labelsData}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelColor={({ kind }) => (kind === 'city' ? '#ef4444' : '#fca5a5')}
        labelSize={({ kind }) => (kind === 'city' ? 2.6 : 2.15)}
        labelDotRadius={({ kind }) => (kind === 'city' ? 0.45 : 0.28)}
        labelAltitude={({ kind }) => (kind === 'city' ? 0.025 : 0.012)}
        labelResolution={3}
      />
    </div>
  );
}
import { useRef, useEffect, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeComponent({ selectedCity }) {
  const globeRef     = useRef();
  const containerRef = useRef();
  const [size,  setSize]  = useState({ width: 800, height: 600 });
  const [rings, setRings] = useState([]);
  const [ready, setReady] = useState(false);

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

  // Globe ready — set up auto-rotate and default POV (Canada)
  const handleReady = useCallback(() => {
    if (!globeRef.current) return;
    const ctrl = globeRef.current.controls();
    ctrl.autoRotate      = true;
    ctrl.autoRotateSpeed = 0.4;
    ctrl.enableDamping   = true;
    ctrl.dampingFactor   = 0.1;
    ctrl.minDistance     = 150;
    ctrl.maxDistance     = 700;
    globeRef.current.pointOfView({ lat: 56, lng: -96, altitude: 2.2 });
    setReady(true);
  }, []);

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

  return (
    <div ref={containerRef} className="globe-container">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        onGlobeReady={handleReady}
        /* Textures */
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        /* Atmosphere */
        atmosphereColor="#1a6fa3"
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
      />
    </div>
  );
}
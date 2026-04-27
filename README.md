# 🌡 The New Normal — Climate Explorer

> **Is your city's weather getting more extreme?**
> Search any city on Earth and see 70+ years of real climate data that answers that question.

---

## What Is This?

**The New Normal** is an interactive climate data visualization tool built for the [Tech Builders Program Hackathon 2026](https://tech-builders-program.devpost.com/).

Most people *feel* like weather is getting more extreme — longer heat waves, shorter winters, storms that seem worse every year. But when they go looking for data to confirm or deny that feeling, they hit a wall of government portals, academic papers, and technical dashboards built for scientists, not people.

**The New Normal bridges that gap.** Type in your city. Watch the globe spin to it. Get a clear, personal answer backed by real historical data going back to 1950.

---

##  Live Demo

> _[ Vercel]_

---

##  Features

### Interactive 3D Globe
- Real NASA night-earth satellite texture
- Spins automatically until you search a city
- Flies and zooms to your selected city in real time
- Drops a glowing red marker with pulsing rings at the location

### City Search (Any City on Earth)
- Autocomplete powered by the Open-Meteo Geocoding API
- Searches as you type with debounced requests
- Returns city, region, and country for disambiguation

### Temperature Anomaly Chart
- Shows every year from 1950 to 2024
- Each bar represents how much warmer or cooler that year was compared to the **1951–1980 scientific baseline** (the same baseline used by NASA and NOAA)
- Red bars = warmer than baseline, blue bars = cooler
- Bar intensity scales with how extreme the anomaly is

### Extreme Heat Days Chart
- Counts how many days per year exceeded the **90th percentile** of baseline-period daily maximum temperatures
- Uses a scientifically-derived local threshold rather than a fixed number, so it's meaningful in Edmonton *and* Mumbai
- Orange trend line shows the 10-year moving average to cut through year-to-year noise

### Key Stats Panel
Four at-a-glance numbers shown for every city:
| Stat | What it means |
|---|---|
| Recent decade anomaly | How much hotter the 2015–2024 average is vs the baseline |
| Hottest year on record | The single most anomalous year in the dataset |
| % change in extreme days | Extreme heat days in 2015–2024 vs the 1960s |
| Extreme days in 2024 | How many days last year crossed the threshold |

### Auto-Generated Insight
A plain-English summary sentence is generated from the data — no jargon, just the key takeaway for that specific city.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev environment, hot module reload |
| 3D Globe | react-globe.gl + Three.js | WebGL-powered interactive globe |
| Charts | Recharts | React-native charting, composable |
| Styling | Tailwind CSS v4 + custom CSS | Dark theme, monospace data aesthetic |
| Fonts | IBM Plex Mono, Syne, DM Sans | Scientific data feel, distinctive |
| HTTP | Native fetch | No extra libraries needed |
| Deployment | Vercel | One-command deploy, free tier |

---

## Data Sources

All data is fetched live at runtime — no database, no backend, no API keys required.

### Open-Meteo Historical Weather API
- **URL:** `https://archive-api.open-meteo.com/v1/archive`
- **What it provides:** Daily maximum and minimum temperatures for any lat/lng coordinate going back to 1950
- **Why it's reliable:** ERA5 reanalysis data from the European Centre for Medium-Range Weather Forecasts (ECMWF) — the same dataset climate scientists use
- **Cost:** Free, no authentication required

### Open-Meteo Geocoding API
- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **What it provides:** City name → latitude, longitude, country, region
- **Cost:** Free, no authentication required

---

## Methodology

### Baseline Period
The **1951–1980** average is used as the baseline, matching the standard used by NASA GISS and NOAA for computing temperature anomalies.

### Anomaly Calculation
```
Annual anomaly = yearly average temperature − baseline average (1951–1980)
```
Yearly average temperature is computed as the mean of daily `(max + min) / 2` across all valid days in the year.

### Extreme Heat Threshold
Rather than using a fixed number (e.g. 30°C), we calculate the **90th percentile** of all daily maximum temperatures recorded during the baseline period (1951–1980) for that specific location. A day is classified as "extreme" if its maximum temperature exceeds this threshold. This makes the metric meaningful everywhere — a threshold appropriate for Yellowknife is very different from one appropriate for Chennai.

### 10-Year Moving Average
The trend line on the extreme heat days chart uses a centered 9-year window (±4 years around each data point) to smooth year-to-year natural variability and reveal the underlying trend.

---

## Project Structure

```
the-new-normal/
├── index.html                     # App entry, Google Fonts
├── vite.config.js                 # Vite + Tailwind config
├── package.json
└── src/
    ├── main.jsx                   # React root mount
    ├── App.jsx                    # Top-level layout and state
    ├── index.css                  # Global dark theme styles
    ├── hooks/
    │   └── useClimateData.js      # API fetching + all data processing
    └── components/
        ├── Globe.jsx              # 3D interactive globe (react-globe.gl)
        ├── SearchBar.jsx          # City autocomplete search
        ├── ClimatePanel.jsx       # Stats + charts container
        ├── AnomalyChart.jsx       # Temperature anomaly bar chart
        └── HeatDaysChart.jsx      # Extreme heat days area + trend chart
```

---


## 🎯 Problem Statement

People lack an accessible, personalized tool to verify whether the extreme weather they are experiencing is statistically anomalous. Climate data is abundant but locked behind technical interfaces designed for scientists, not the general public. This gap fuels both climate skepticism and uninformed decision-making by individuals, communities, and local planners.

**The New Normal** makes 75 years of real climate science personally relevant by letting anyone search their own city and see the data for themselves — no scientific background required.

---

## Hackathon Submission

**Event:** Tech Builders Program 2026 — Devpost  
**Categories targeted:**
-  Climate and Sustainability
-  Data Science and Analytics
-  Web and Application Development


---

## License

MIT — do whatever you want with it.


# Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Entry Points](#entry-points)
3. [App.jsx](#appjsx)
4. [Hooks](#hooks)
   - [useClimateData.js](#useclimatedatajs)
5. [Components](#components)
   - [Globe.jsx](#globejsx)
   - [SearchBar.jsx](#searchbarjsx)
   - [ClimatePanel.jsx](#climatepaneljsx)
   - [AnomalyChart.jsx](#anomalychartjsx)
   - [HeatDaysChart.jsx](#heatdayschartjsx)
6. [Styling](#styling)
7. [Data Flow](#data-flow)
8. [API Reference](#api-reference)

---

## Architecture Overview

The New Normal is a fully client-side React application. There is no backend server, no database, and no API keys. All data is fetched directly from public APIs at runtime in the browser.

```
index.html
  └── main.jsx              (React root)
        └── App.jsx          (state, layout)
              ├── Globe.jsx           (3D globe, react-globe.gl)
              ├── SearchBar.jsx       (city autocomplete)
              └── ClimatePanel.jsx    (data display)
                    ├── AnomalyChart.jsx
                    └── HeatDaysChart.jsx

src/hooks/useClimateData.js   (all API calls + data processing)
src/index.css                 (global dark theme)
```

State lives entirely in `App.jsx` and flows down as props. The `useClimateData` hook handles all async logic and exposes clean state values. Components are pure presentational — they receive data as props and render it.

---

## Entry Points

### `index.html`

Standard Vite HTML shell. Two things added beyond the default:

- Google Fonts `<link>` tags for **IBM Plex Mono**, **Syne**, and **DM Sans**
- A favicon emoji (`🌡`) set inline as an SVG data URI

### `src/main.jsx`

Unchanged from the Vite default. Mounts the `<App />` component into `#root` and imports `index.css`.

---

## App.jsx

The top-level component. Owns all shared state and composes the full page layout.

### State

```js
// From the useClimateData hook:
loading      // boolean — true while the archive API call is in flight
error        // string | null — error message if the fetch failed
cityData     // object | null — the selected city from the geocoding API
climateData  // object | null — processed climate data (see hook docs)
```

### Layout structure

```
<div class="app">
  <header class="app-header">        // logo + tagline, absolutely positioned
  <div class="globe-section">        // 600px tall
    <GlobeComponent />
    <div class="globe-fade-bottom"/> // CSS gradient fade to background
    <div class="search-overlay">     // floats over bottom of globe
      <SearchBar />
  <p class="prompt-text">            // shown only before any city is selected
  <ClimatePanel />                   // shown after city selected or loading
```

### Key behaviour

- `handleCitySelect` is memoized with `useCallback` and passed to `SearchBar`. When the user picks a city, it calls `fetchClimateData(city)` from the hook, which triggers the full data pipeline.
- The globe and the data panel share `cityData` — the globe uses it to fly to the location, the panel uses it to label the charts.

---

## Hooks

### `useClimateData.js`

**Location:** `src/hooks/useClimateData.js`

The single source of truth for all data fetching and processing. Exposes a clean interface so `App.jsx` never has to deal with raw API responses.

#### Exports

```js
const {
  loading,          // boolean
  error,            // string | null
  cityData,         // object | null — raw city object from geocoding API
  climateData,      // object | null — fully processed (see shape below)
  searchCity,       // async (query: string) => City[]
  fetchClimateData, // async (city: City) => void
} = useClimateData();
```

#### `searchCity(query)`

Calls the Open-Meteo Geocoding API and returns an array of up to 6 city result objects. Used internally by `SearchBar` — not called from `App.jsx`.

```js
// Example result object
{
  id: 2126682,
  name: "Edmonton",
  latitude: 53.55014,
  longitude: -113.46871,
  country: "Canada",
  country_code: "CA",
  admin1: "Alberta",
}
```

#### `fetchClimateData(city)`

Fetches daily `temperature_2m_max` and `temperature_2m_min` from the Open-Meteo Archive API for the given lat/lng from `1950-01-01` to `2024-12-31`, then runs the full processing pipeline. Sets `loading`, `error`, and `climateData` accordingly.

#### `climateData` shape

```js
{
  anomalyData: [
    {
      year: 1950,
      anomaly: -0.42,       // degrees C vs baseline
      avgTemp: 2.14,        // absolute annual mean temp
      extremeDays: 18,      // days exceeding the 90th pct threshold
    },
    // ... one entry per year through 2024
  ],
  baselineAvg: 2.56,        // mean annual temp over 1951–1980
  extremeThreshold: 26.3,   // 90th pct daily max from baseline period
  stats: {
    hottestYear: 2021,
    hottestAnomaly: 2.31,
    recentAnomaly: 1.74,    // mean anomaly 2015–2024
    extremeIncrease: 48,    // % change vs 1960s decade
    currentExtreme: 34,     // extreme days in 2024
  }
}
```

#### `processClimateData(daily)` — internal

This private function does all the heavy lifting after the raw API response arrives. Steps in order:

**1. Build daily records, drop nulls**

The API occasionally returns `null` for days with missing station data. These are filtered out before any calculations.

```js
const daily = time.reduce((acc, date, i) => {
  const mx = temperature_2m_max[i];
  const mn = temperature_2m_min[i];
  if (mx == null || mn == null || isNaN(mx) || isNaN(mn)) return acc;
  acc.push({ year: parseInt(date.slice(0, 4)), mean: (mx + mn) / 2, max: mx });
  return acc;
}, []);
```

**2. Aggregate to yearly buckets**

Groups daily records by year, collecting arrays of daily mean temps and daily max temps for each year.

**3. Calculate the baseline average**

Filters to years 1951–1980 and computes the mean of all yearly average temperatures. This is the reference value subtracted from every year to produce the anomaly.

**4. Derive the 90th-percentile extreme heat threshold**

Collects every individual daily maximum temperature recorded during the baseline years (1951–1980), sorts them, and takes the value at the 90th percentile position. This becomes the location-specific threshold for classifying a day as an "extreme heat day."

```js
const baselineMaxes = baselineYears.flatMap(d => d.maxes).sort((a, b) => a - b);
const p90 = baselineMaxes[Math.floor(baselineMaxes.length * 0.9)];
```

**5. Build the anomaly series**

For each year, computes:
- `anomaly` = yearly average temp − baseline average
- `extremeDays` = count of days in that year where daily max exceeded `p90`

**6. Compute summary stats**

- `recentAnomaly` — mean anomaly across 2015–2024
- `extremeIncrease` — percentage change between the 1960–1969 decade mean and the 2015–2024 mean for extreme heat days
- `hottestYear` — year with the highest anomaly in the full dataset

---

## Components

### `Globe.jsx`

**Location:** `src/components/Globe.jsx`

Wraps `react-globe.gl` (which wraps Three.js) in a sized, reactive container.

#### Props

| Prop | Type | Description |
|---|---|---|
| `selectedCity` | `object \| null` | City object from geocoding API. When this changes, the globe flies to that location. |

#### Internal state

```js
size   // { width, height } — measured from the DOM container via ResizeObserver
rings  // array — the pulsing ring data passed to react-globe.gl
ready  // boolean — true after onGlobeReady fires
```

#### Globe textures

| Texture | URL | What it is |
|---|---|---|
| Globe surface | `//unpkg.com/three-globe/example/img/earth-night.jpg` | NASA Blue Marble night lights |
| Bump map | `//unpkg.com/three-globe/example/img/earth-topology.png` | Elevation data for 3D terrain |
| Background | `//unpkg.com/three-globe/example/img/night-sky.png` | Starfield |

#### `handleReady`

Fires once when Three.js has finished initialising. Sets up the OrbitControls:

```js
ctrl.autoRotate      = true;
ctrl.autoRotateSpeed = 0.4;
ctrl.enableDamping   = true;   // smooth deceleration
ctrl.dampingFactor   = 0.1;
ctrl.minDistance     = 150;    // prevent zooming inside the globe
ctrl.maxDistance     = 700;    // prevent zooming too far out
```

Then sets the initial camera position to look at Canada:

```js
globeRef.current.pointOfView({ lat: 56, lng: -96, altitude: 2.2 });
```

#### City selection effect

When `selectedCity` changes (and the globe is ready), this effect:

1. Disables auto-rotate
2. Calls `pointOfView({ lat, lng, altitude: 1.6 }, 1400)` — flies to the city over 1.4 seconds
3. Sets `rings` state to trigger the pulsing ring animation
4. Clears the rings after 4.5 seconds via `setTimeout`

#### Ring animation

```js
ringsData={rings}
ringColor={() => t => `rgba(239,68,68,${1 - t})`}  // fades from red to transparent
ringMaxRadius={4}
ringPropagationSpeed={2}
ringRepeatPeriod={900}
```

`t` is a value 0→1 representing how far the ring has expanded. The color function maps that to a fading red opacity.

#### Sizing

A `ResizeObserver` watches the container div and updates `size` state whenever the element dimensions change. This width/height is passed directly to the `<Globe>` component to keep the canvas correctly sized.

---

### `SearchBar.jsx`

**Location:** `src/components/SearchBar.jsx`

A controlled input with debounced geocoding autocomplete.

#### Props

| Prop | Type | Description |
|---|---|---|
| `onCitySelect` | `(city) => void` | Called when the user clicks a result |

#### Debounce

Searches fire 380ms after the user stops typing, using a `useRef`-stored timeout ID that gets cleared and reset on every keystroke. This prevents hammering the geocoding API on every character.

```js
debounce.current = setTimeout(async () => {
  // fetch and setResults
}, 380);
```

#### Outside-click dismissal

A `mousedown` event listener on `document` closes the dropdown when the user clicks anywhere outside the search wrapper. Uses `wrapperRef` to check containment.

Note: `onMouseDown` (not `onClick`) is used on result items so that the item click fires before the input's `onBlur`, preventing a race condition where the dropdown closes before the selection registers.

---

### `ClimatePanel.jsx`

**Location:** `src/components/ClimatePanel.jsx`

A pure presentational container. Handles three render states:

| State | What renders |
|---|---|
| `loading === true` | Spinner + "Fetching 70+ years…" message |
| `error !== null` | Error message with the API error string |
| `climateData !== null` | Full panel: header, stats row, charts, insight bar |

#### Insight bar

A plain-English sentence is constructed from the stats:

```js
const insightParts = [];
if (recentAnomaly >= 0.5)   insightParts.push(`...averaged +${recentAnomaly}°C above baseline...`);
if (extremeIncrease > 10)   insightParts.push(`...extreme heat days up ${extremeIncrease}%...`);
if (hottestYear >= 2010)    insightParts.push(`...hottest year was ${hottestYear}...`);
const insight = insightParts.join(', and ');
```

Only facts that clear their threshold are included — if a city's data doesn't show a strong warming signal, the bar is omitted entirely.

---

### `AnomalyChart.jsx`

**Location:** `src/components/AnomalyChart.jsx`

A Recharts `BarChart` showing annual temperature anomaly from 1950 to 2024.

#### Color logic

Each bar is individually colored using Recharts `<Cell>`. The fill is calculated per data point:

```js
const intensity = Math.min(0.35 + Math.abs(d.anomaly) * 0.28, 1);
fill = d.anomaly >= 0
  ? `rgba(239,68,68,${intensity})`    // red, scaled by magnitude
  : `rgba(96,165,250,${intensity})`   // blue, scaled by magnitude
```

This means a small anomaly is a faint red/blue, and a large anomaly is a saturated red/blue — the chart communicates magnitude through color intensity, not just bar height.

#### `ReferenceLine`

A horizontal line at `y={0}` marks the baseline. Years above it are warm anomalies, below it are cool anomalies.

#### Custom tooltip

Shows the year and the signed anomaly in the matching color:

```
1998
+1.43°C
```

---

### `HeatDaysChart.jsx`

**Location:** `src/components/HeatDaysChart.jsx`

A Recharts `ComposedChart` combining an `Area` series (yearly raw count) and a `Line` series (10-year moving average trend).

#### `withMovingAvg(data)`

A pure function that runs before render. For each data point, it takes a 9-point window centered on that year (±4 years, clamped at edges), averages the `extremeDays` values, and returns the data with a `trend` field added.

```js
const window = arr.slice(Math.max(0, i - 4), Math.min(arr.length, i + 5));
const avg = window.reduce((s, w) => s + w.extremeDays, 0) / window.length;
```

#### Visual layers

| Layer | Type | Color | Purpose |
|---|---|---|---|
| Yearly raw count | `Area` | Red `#ef4444` | Shows year-to-year volatility |
| Area fill | Gradient | Red → transparent | Gives weight to the area under the line |
| 10-year trend | `Line` | Orange `#f97316` | Reveals the underlying direction |

---

## Styling

**Location:** `src/index.css`

All styles are written as custom CSS using CSS custom properties (variables). Tailwind is included but used minimally — the dark theme requires too many specific values to be done cleanly with utility classes alone.

#### CSS variables

```css
--bg:        #050c14   /* page background — near-black blue */
--surface:   #0d1b2a   /* card/panel background */
--surface-2: #132338   /* elevated surface (tooltip) */
--border:    rgba(255, 255, 255, 0.07)
--text:      #e2e8f0   /* primary text */
--muted:     #4a6280   /* secondary text, labels */
--accent:    #ef4444   /* red — heat, anomaly, marker */
--cool:      #60a5fa   /* blue — cool anomalies */
```

#### Typography

Three fonts are used with distinct roles:

| Font | Use |
|---|---|
| **IBM Plex Mono** | All numeric data, coordinates, labels, monospace UI elements |
| **Syne** | Display headings — app title, city name, chart titles |
| **DM Sans** | Body text, search input, descriptions |

#### Animations

| Name | What it does |
|---|---|
| `dotpulse` | Breathing glow on the red logo dot |
| `fadeUp` | Climate panel slides up and fades in on load |
| `spin` | Loading spinner rotation |

---

## Data Flow

This is the sequence of events from the user typing a city name to charts appearing on screen:

```
1. User types in SearchBar
      ↓ (380ms debounce)
2. SearchBar fetches Open-Meteo Geocoding API
      ↓
3. Dropdown shows results
      ↓
4. User clicks a result → onCitySelect(city) fires
      ↓
5. App.jsx calls fetchClimateData(city)
      ↓  (simultaneously)
      ├── setCityData(city)   → Globe.jsx receives new prop → flies to location
      └── setLoading(true)    → ClimatePanel shows spinner
      ↓
6. Open-Meteo Archive API fetched (~1–3s, 75 years of daily data)
      ↓
7. processClimateData() runs on the raw response
      ↓
8. setClimateData(result) → setLoading(false)
      ↓
9. ClimatePanel renders stats + charts with processed data
```

---

## API Reference

### Open-Meteo Geocoding

```
GET https://geocoding-api.open-meteo.com/v1/search

Parameters:
  name     string   City name to search
  count    number   Max results (we use 6)
  language string   Result language (en)
  format   string   Response format (json)

Response:
  { results: City[] }
```

### Open-Meteo Historical Archive

```
GET https://archive-api.open-meteo.com/v1/archive

Parameters:
  latitude    number   Decimal degrees
  longitude   number   Decimal degrees
  start_date  string   YYYY-MM-DD (we use 1950-01-01)
  end_date    string   YYYY-MM-DD (we use 2024-12-31)
  daily       string   Comma-separated variables
                       (temperature_2m_max,temperature_2m_min)
  timezone    string   UTC

Response:
  {
    daily: {
      time:               string[]   // YYYY-MM-DD for each day
      temperature_2m_max: number[]   // °C, nullable
      temperature_2m_min: number[]   // °C, nullable
    }
  }
```

Both APIs are free, require no authentication, and support CORS — meaning they can be called directly from the browser with no proxy needed.
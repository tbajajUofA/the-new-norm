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
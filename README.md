# The New Normal | Tech Builder Program Hackathon 2026 Submission

Description
-----------------
The New Normal is an interactive, city-focused climate evidence tool that turns raw historical weather data into simple, personal answers.
 Is your city hotter than it used to be? It uses the Open‑Meteo archive to compute year-by-year temperature anomalies against the 1951–1980 scientific baseline and visualizes the results with clear charts and a live 3D globe.

Screenshots
-----------


![1 — Search / Starting page](docs/screenshots/1_search_aka_starting_page.png)

![2 — Results](docs/screenshots/2_results.png)

![3 — Anomaly and extreme heat days](docs/screenshots/3_anomaly_and_extreme_heat_days.png)

![4 — Warming trend](docs/screenshots/4_warming_trend.png)

![5 — Heat map](docs/screenshots/5_heat_map.png)

![6 — Transformer 14-day forecast](docs/screenshots/6_transformer_14%20day%20forecast.png)

![7 — Transformer results](docs/screenshots/7_transformer_results.png)

![8 — Five-year climate outlook](docs/screenshots/8_five_year%20climate_outlook.png)

![9 — Call to action](docs/screenshots/9_call_to_action.png)

Problem statement 
-----------------------------------
People lack an accessible, personalized tool to verify whether the extreme weather they are experiencing is statistically anomalous. Climate datasets are available, but they are scattered, technical, and difficult for non-experts to interpret. That creates a credibility gap and reduces public engagement with local climate impacts.

The New Normal solves this by providing a one-click city lookup that produces scientifically grounded local metrics (annual anomalies, extreme days, trend projections) and plain-English summaries that anyone can understand and act upon.

Core features
-------------
- City search (Open‑Meteo geocoding) with autocomplete
- Interactive 3D globe that flies to the selected city
- Temperature anomaly bar chart (1950–2024 vs 1951–1980 baseline)
- Extreme heat days per year with a 10-year moving average
- Auto-generated plain-English insight summary for each city
- 14-day local forecast (Transformer model) and a 5-year statistical outlook

Solution overview
-----------------
Design goals
- Make scientific data personal and local
- Avoid overwhelming users with jargon; emphasize clear visuals and a one-sentence takeaway
- Use free public data sources so anyone can reproduce the results

Data pipeline (brief)
- Geocode city → lat/lon (Open‑Meteo Geocoding API)
- Fetch daily max/min temperatures for 1950–2024 (Open‑Meteo Archive API)
- Clean daily records, compute yearly averages and yearly max lists
- Baseline (1951–1980) computed from the archive; anomaly = yearAvg − baselineAvg
- 90th-percentile of baseline daily maxes used as the local extreme-day threshold

Architecture & tech
-------------------
- Frontend: React + Vite (fast dev), Recharts for visualizations, react-globe.gl for globe
- Styling: Tailwind + custom CSS (dark theme with high-contrast data accents)
- Backend: Optional FastAPI scaffold exists in `/backend` (model-serving & experiments)
- Data: Open‑Meteo (historical and geocoding)


Notes: model artifacts are expected in `backend/ml/saved_model/` if you want Transformer inference. The API returns 503 when artifacts are missing so it won't crash the server.

APIs, Visualizations, and Rationale
-----------------------------------

APIs used
---------
- **Open‑Meteo Geocoding API** — convert city names to latitude/longitude (autocomplete + lookup).
- **Open‑Meteo Archive API** — historical daily temperature series used to compute baselines and yearly anomalies (1950–2024).
- **Open‑Meteo Forecast API** — optional short-term observations/forecasts used to validate or seed the local Transformer where applicable.
- **Local model inference** — an optional Transformer artifact stored under `backend/ml/saved_model/` for on-prem 14-day forecasts (see `/backend/ml`).

Visualizations (components)
---------------------------
- `SearchBar` — city lookup with autocomplete and quick navigation.
- `Globe` — interactive 3D globe that flies to the selected city for spatial context.
- `AnomalyChart` — per-year temperature anomaly bars (1950–2024 vs 1951–1980 baseline).
- `AnomalyTrendChart` — trend lines and moving averages highlighting long-term warming.
- `DecadeHeatmap` — seasonal/decadal heatmap view for monthly/seasonal patterns.
- `HeatDaysChart` — extreme heat days per year with a 10-year moving average to show persistent changes.
- `ForecastChart` — 14-day forecast produced by the Transformer model (or fallback) for short-term local outlooks.

Modeling choices
----------------
- **Why a Transformer for 14-day forecasts:** Transformers are strong sequence models that use attention to capture long-range dependencies and non-linear interactions in time-series data. Compared with simple persistence or AR models, a Transformer can learn complex temporal patterns from multivariate inputs (seasonality, recent anomalies, local climatology), improving short-term forecast skill and producing coherent multi-day sequences.

Why the 5-year outlook
----------------------
- The 5-year outlook is a short-to-mid-term statistical projection (not a climate model projection). It smooths year-to-year noise and highlights the recent trajectory of local change, which is more actionable for users and planners than single-year fluctuations. It provides context for near-term adaptation and communication.

Why include a Call to Action
----------------------------
- The call to action converts insight into engagement: it encourages users to share results, verify local observations, contribute data or feedback, and take practical steps (community outreach, policy contact, local preparedness). It bridges awareness with tangible next steps and helps the project have real-world impact.


Team & credits
---------------
Contributors:
- Tj Baja AKA tbajajUofA

Data & license
--------------
Data: Open‑Meteo Archive API (ERA5 reanalysis)
License: MIT (this repo)



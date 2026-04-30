# Project Map

This repo is a climate app with two layers:

1. Frontend first: the React/Vite app is the main product surface.
2. Backend second: the FastAPI service exists to support forecast and regime outputs.

Strict rules for the next agent:

- Do not waste time on generated or local-only files.
- Do not touch `backend/venv/`, `node_modules/`, `dist/`, `__pycache__/`, or saved model artifacts unless the task explicitly says to.
- If behavior changes, update the closest test that covers it.
- If you need the main app path, start with [src/App.jsx](/home/tj/tnn/src/App.jsx) and [backend/app/main.py](/home/tj/tnn/backend/app/main.py).
- Treat [README.md](/home/tj/tnn/README.md) as a summary, not as the source of truth for code behavior.

## Root Files

- [README.md](/home/tj/tnn/README.md) is the project story and demo doc.
- [package.json](/home/tj/tnn/package.json) defines the frontend app name, scripts, and JS dependencies.
- [package-lock.json](/home/tj/tnn/package-lock.json) locks the frontend dependency tree.
- [vite.config.js](/home/tj/tnn/vite.config.js) configures the Vite build and dev server.
- [eslint.config.js](/home/tj/tnn/eslint.config.js) contains the frontend linting rules.
- [index.html](/home/tj/tnn/index.html) is the Vite entry HTML shell.
- [.gitignore](/home/tj/tnn/.gitignore) blocks local environments, generated files, and saved model artifacts.
- [LICENSE](/home/tj/tnn/LICENSE) contains the repo license.

## Frontend

- [src/main.jsx](/home/tj/tnn/src/main.jsx) mounts the React app into the DOM.
- [src/App.jsx](/home/tj/tnn/src/App.jsx) controls the entire screen flow: boot, search, globe, climate data, forecast, CTA, footer.
- [src/App.css](/home/tj/tnn/src/App.css) holds app-specific layout and visual styling.
- [src/index.css](/home/tj/tnn/src/index.css) sets global styles, typography, background, and theme tokens.

- [src/components/SearchBar.jsx](/home/tj/tnn/src/components/SearchBar.jsx) handles city autocomplete and selection.
- [src/components/Globe.jsx](/home/tj/tnn/src/components/Globe.jsx) renders the 3D globe and flies to the selected city.
- [src/components/ClimatePanel.jsx](/home/tj/tnn/src/components/ClimatePanel.jsx) shows the main city climate summary and metrics.
- [src/components/AnomalyChart.jsx](/home/tj/tnn/src/components/AnomalyChart.jsx) plots yearly temperature anomalies.
- [src/components/AnomalyTrendChart.jsx](/home/tj/tnn/src/components/AnomalyTrendChart.jsx) shows warming trend and smoothing views.
- [src/components/HeatDaysChart.jsx](/home/tj/tnn/src/components/HeatDaysChart.jsx) charts extreme heat days and moving averages.
- [src/components/DecadeHeatmap.jsx](/home/tj/tnn/src/components/DecadeHeatmap.jsx) visualizes seasonal or decade-scale patterns.
- [src/components/ForecastChart.jsx](/home/tj/tnn/src/components/ForecastChart.jsx) displays the Chronos projection, 1.5°C crossing year, and regime output.

- [src/hooks/useClimateData.js](/home/tj/tnn/src/hooks/useClimateData.js) fetches Open-Meteo archive data, computes baselines, anomalies, and extreme-day stats.
- [src/hooks/useForecast.js](/home/tj/tnn/src/hooks/useForecast.js) streams forecast requests to the backend and stores forecast history.
- [src/utils/climateCard.js](/home/tj/tnn/src/utils/climateCard.js) contains helper logic for climate UI cards.

- [src/assets/hero.png](/home/tj/tnn/src/assets/hero.png) is a frontend image asset used for presentation.
- [src/assets/react.svg](/home/tj/tnn/src/assets/react.svg) is the default React icon asset.
- [src/assets/vite.svg](/home/tj/tnn/src/assets/vite.svg) is the default Vite icon asset.

## Backend

- [backend/app/main.py](/home/tj/tnn/backend/app/main.py) is the FastAPI entry point, CORS setup, health route, and startup warmup.
- [backend/app/routes/climate.py](/home/tj/tnn/backend/app/routes/climate.py) exposes `/api/climate/crossing`, `/api/climate/regime`, `/api/climate/forecast5`, and the streaming endpoint.
- [backend/app/schemas/climate.py](/home/tj/tnn/backend/app/schemas/climate.py) defines request and response models for the climate API.

- [backend/ml/chronos_forecast.py](/home/tj/tnn/backend/ml/chronos_forecast.py) loads Chronos, smooths anomaly series, and generates probabilistic forecasts.
- [backend/ml/crossing_predictor.py](/home/tj/tnn/backend/ml/crossing_predictor.py) converts forecasts into a 1.5°C crossing-year result.
- [backend/ml/tipping_detector.py](/home/tj/tnn/backend/ml/tipping_detector.py) classifies the climate regime as stable, accelerating, or tipping.

- [backend/tests/test_health.py](/home/tj/tnn/backend/tests/test_health.py) checks the backend health endpoint.
- [backend/tests/test_predict.py](/home/tj/tnn/backend/tests/test_predict.py) tests the climate forecast and regime endpoints with monkeypatched model outputs.

- [backend/requirements.txt](/home/tj/tnn/backend/requirements.txt) lists Python dependencies.
- [backend/runtime.txt](/home/tj/tnn/backend/runtime.txt) pins the Python runtime for deployment.
- [backend/Procfile](/home/tj/tnn/backend/Procfile) defines the backend process command for hosting platforms.
- [backend/.env.example](/home/tj/tnn/backend/.env.example) documents expected backend environment variables.

- [backend/app/__init__.py](/home/tj/tnn/backend/app/__init__.py), [backend/app/routes/__init__.py](/home/tj/tnn/backend/app/routes/__init__.py), [backend/app/schemas/__init__.py](/home/tj/tnn/backend/app/schemas/__init__.py), [backend/app/services/__init__.py](/home/tj/tnn/backend/app/services/__init__.py), [backend/ml/__init__.py](/home/tj/tnn/backend/ml/__init__.py), and [backend/tests/__init__.py](/home/tj/tnn/backend/tests/__init__.py) are package markers.

## Public Assets

- [public/favicon.svg](/home/tj/tnn/public/favicon.svg) is the browser favicon.
- [public/icons.svg](/home/tj/tnn/public/icons.svg) contains reusable public SVG icons.

## Docs And Screenshots

- [docs/screenshots/1_search_aka_starting_page.png](/home/tj/tnn/docs/screenshots/1_search_aka_starting_page.png) shows the starting search state.
- [docs/screenshots/2_results.png](/home/tj/tnn/docs/screenshots/2_results.png) shows the populated city result view.
- [docs/screenshots/3_anomaly_and_extreme_heat_days.png](/home/tj/tnn/docs/screenshots/3_anomaly_and_extreme_heat_days.png) shows anomaly and heat-day charts.
- [docs/screenshots/4_warming_trend.png](/home/tj/tnn/docs/screenshots/4_warming_trend.png) shows the warming trend view.
- [docs/screenshots/5_heat_map.png](/home/tj/tnn/docs/screenshots/5_heat_map.png) shows the heatmap visualization.
- [docs/screenshots/6_transformer_14 day forecast.png](/home/tj/tnn/docs/screenshots/6_transformer_14 day forecast.png) is the older forecast screenshot kept for reference.
- [docs/screenshots/7_transformer_results.png](/home/tj/tnn/docs/screenshots/7_transformer_results.png) is another older forecast result screenshot.
- [docs/screenshots/8_five_year climate_outlook.png](/home/tj/tnn/docs/screenshots/8_five_year climate_outlook.png) shows the current five-year outlook.
- [docs/screenshots/9_call_to_action.png](/home/tj/tnn/docs/screenshots/9_call_to_action.png) shows the CTA section.

## Local Only Or Generated

- Never commit `backend/venv/`.
- Never commit `backend/ml/saved_model/model.pt` or `backend/ml/saved_model/scaler.pkl`.
- Never commit `__pycache__/`, `*.pyc`, `.pytest_cache/`, `dist/`, or `node_modules/`.

## How The App Flows

1. The user searches for a city in the frontend search bar.
2. `useClimateData` fetches Open-Meteo archive data and computes annual anomalies plus heat-day stats.
3. `App.jsx` passes the processed anomaly series to `useForecast`.
4. `useForecast` posts the anomalies to the FastAPI streaming endpoint.
5. The backend loads Chronos, forecasts the anomaly trajectory, classifies the regime, and returns the crossing-year and five-year outlook.
6. The frontend renders the globe, charts, forecast cards, and the CTA/footer.

## Notes For The Next Agent

- Start with `src/App.jsx` for UI work and `backend/app/main.py` for backend routing questions.
- Treat the backend as a support service, not the product surface.
- Keep changes small and local.
- Do not expand scope just because a file looks interesting.
- If `git add .` becomes slow again, check for a new virtualenv or generated folder before doing anything else.
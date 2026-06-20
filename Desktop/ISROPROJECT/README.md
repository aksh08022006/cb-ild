# Satellite-Derived Surface AQI & HCHO Hotspot Detection over India

**Development of Satellite-Derived Surface AQI and Identification of HCHO Hotspots over
India using INSAT-3D, Sentinel-5P, CPCB and Reanalysis Data**

An ISRO research-grade project combining satellite remote sensing, reanalysis meteorology,
ground observations and deep learning to (1) estimate surface pollutant concentrations and
map daily Air Quality Index (AQI) over India, and (2) detect, attribute and trace
formaldehyde (HCHO) hotspots driven by VOC emissions and biomass burning.

---

## Research questions

| # | Objective | Question |
|---|-----------|----------|
| 1 | Surface AQI | Can satellite observations predict ground-level pollution and generate daily AQI maps across India? |
| 2 | HCHO hotspots | Can TROPOMI HCHO identify VOC emission hotspots and biomass-burning episodes across India? |
| 3 | Source attribution (novel) | How much do crop-residue burning, forest fires and long-range transport contribute to HCHO enhancement? |

## Headline novelty

> Satellite-derived AQI mapping **+** HCHO hotspot detection **+** biomass-burning
> attribution **+** atmospheric transport analysis **+** explainable deep learning.

---

## Architecture

```
 CPCB stations ─┐
 INSAT-3D AOD ──┤
 TROPOMI gases ─┤
 ERA5 met ──────┼──▶ Feature engineering ──▶ CNN-LSTM ──▶ Surface pollutants ──▶ AQI engine ──▶ Daily AQI maps
 Land cover ────┤
 Elevation ─────┤
 Fire counts ───┘

 TROPOMI HCHO ──┐
 VIIRS fires ───┤
 ERA5 winds ────┼──▶ Hotspot detection (PHV / Gi* / DBSCAN) ──▶ Source attribution ──▶ Transport analysis ──▶ HCHO Atlas
 Land cover ────┘
```

## Phases (see [`docs/`](docs/))

| Phase | Doc | Topic |
|-------|-----|-------|
| 1 | [01_literature_review.md](docs/01_literature_review.md) | Literature review (AQI, AOD→PM2.5, HCHO chemistry) |
| 2 | [02_data_collection.md](docs/02_data_collection.md) | Data collection (8 datasets) |
| 3 | [03_database_design.md](docs/03_database_design.md) | Unified India-wide database (~50–100 M rows) |
| 4 | [04_preprocessing.md](docs/04_preprocessing.md) | Regridding, QA filtering, collocation |
| 5 | [05_feature_engineering.md](docs/05_feature_engineering.md) | Feature engineering |
| 6 | [06_models.md](docs/06_models.md) | RF / XGBoost / CNN / LSTM / CNN-LSTM |
| 7 | [07_training_validation.md](docs/07_training_validation.md) | Training & validation framework |
| 8 | [08_aqi_engine.md](docs/08_aqi_engine.md) | CPCB AQI engine |
| 9 | [09_aqi_mapping.md](docs/09_aqi_mapping.md) | Daily/seasonal AQI atlas |
| 10 | [10_hcho_hotspots.md](docs/10_hcho_hotspots.md) | PHV / Getis-Ord Gi* / DBSCAN |
| 11 | [11_biomass_burning.md](docs/11_biomass_burning.md) | Biomass-burning detection |
| 12 | [12_hcho_ozone.md](docs/12_hcho_ozone.md) | HCHO–ozone relationship |
| 13 | [13_transport_analysis.md](docs/13_transport_analysis.md) | Wind / HYSPLIT transport |
| 14 | [14_explainability.md](docs/14_explainability.md) | SHAP explainability |
| — | [15_dashboard.md](docs/15_dashboard.md) | Streamlit dashboard |
| — | [references.md](docs/references.md) | Reference papers & datasets |
| ★ | [IMPLEMENTATION_REPORT.md](docs/IMPLEMENTATION_REPORT.md) | Deep-research synthesis · what's built · demo results |

---

## Quick start

```bash
# 0. Install
pip install -e .                 # or: conda env create -f environment.yml && conda activate isro-aqi

# 1. TRY IT NOW — full pipeline end-to-end on synthetic India data, NO credentials:
make demo                        # -> outputs/ : AQI maps, HCHO hotspots, figures, demo_summary.md
#   (quick smoke version: make demo-fast)

# --- then, for REAL data ---
# 2. Authenticate Google Earth Engine (one-time)
earthengine authenticate

# 3. Configure your run
cp config/config.example.yaml config/config.yaml   # then edit GEE project id, AOI, dates

# 4. Run the pipeline end-to-end (each step is also runnable standalone)
make ingest        # pull Sentinel-5P / ERA5 / MODIS / WorldCover / SRTM via GEE; INSAT & CPCB local
make preprocess    # regrid + QA filter + collocate to CPCB stations
make database      # assemble the unified training table
make train         # train CNN-LSTM (+ RF/XGB baselines)
make aqi           # estimate surface pollutants + compute AQI + render maps
make hcho          # HCHO hotspots + attribution + transport
make dashboard     # launch Streamlit dashboard
```

> **`make demo` runs all 14 phases** (synthetic data → models → AQI maps → HCHO
> hotspots → attribution → ozone → transport → SHAP). See
> [`docs/IMPLEMENTATION_REPORT.md`](docs/IMPLEMENTATION_REPORT.md) for the
> deep-research synthesis, what's implemented, and the demonstration results.

## Repository layout

```
config/        YAML configuration (AOI, dates, dataset asset IDs, AQI breakpoints, regions)
docs/          Per-phase research blueprint (methodology, math, rationale, figures)
src/isro_aqi/  Python package
  ingestion/   GEE + MOSDAC + CPCB data downloaders
  preprocessing/ regridding, QA filtering, temporal aggregation, collocation
  database/    unified schema + builder
  features/    feature engineering
  models/      RF, XGBoost, CNN, LSTM, CNN-LSTM + training loop
  aqi/         CPCB AQI sub-index + aggregation engine
  hcho/        PHV, Getis-Ord Gi*, DBSCAN, source attribution, ozone, transport
  explain/     SHAP explainability
  viz/         maps & publication figures
pipelines/     CLI entry points (one per stage)
dashboard/     Streamlit app
tests/         unit tests (AQI engine, PHV, Gi* are deterministic → fully tested)
data/          raw / interim / processed / external (gitignored)
outputs/       figures / maps / atlas
references/    reference PDFs
```

## Compute model

- **Server-side (Google Earth Engine):** Sentinel-5P (NO₂/SO₂/CO/O₃/HCHO), ERA5(-Land),
  MODIS/VIIRS fire, ESA WorldCover, SRTM — filtered, reduced and exported as analysis-ready
  rasters/tables, keeping India-scale data off the local disk.
- **Local:** INSAT-3D AOD (MOSDAC), CPCB station CSVs, database assembly, model training,
  AQI computation, HCHO analysis, figures and dashboard.

See **`docs/`** for the full scientific blueprint. This README is the map; the docs are the manual.

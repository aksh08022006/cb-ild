# Demo run summary

_Synthetic India data; exercises the full redesigned pipeline (6 changes)._

- Training rows: **450** | features: **36**


## AOD gap-fill (Change 1)
- 9% missing filled; clustered-holdout CV r2=None, rmse=None


## TROPOMI NO2 calibration (Change 2)
- surface-NO2 r2 **0.986** (raw column r2 0.9268283342165342); gain over raw column +0.0595


## Surface-pollutant skill — trend vs hybrid (Changes 3, 6)

| Pollutant | trend R² | hybrid R² | India target |
|---|---|---|---|
| pm25 | 0.902 | 0.900 | 0.86 |
| pm10 | 0.869 | 0.866 | 0.85 |
| no2_obs | 0.949 | 0.949 | 0.83 |
| so2_obs | 0.565 | 0.565 | 0.4 |
| o3_obs | 0.469 | 0.465 | 0.6 |
| co_obs | 0.487 | 0.483 | 0.58 |

## PM2.5 CV (random vs spatial vs temporal)
- random **0.875**, spatial **0.214**, temporal **0.903** (spatial < random confirms autocorrelation leakage — Wang 2023).


## CNN-LSTM (ISRO-specified learner, val)

pm25 R²=0.40, pm10 R²=0.42, no2_obs R²=0.39, so2_obs R²=0.02, o3_obs R²=0.07, co_obs R²=0.35


## Dual AQI atlas — 2021-10-22 (dual index)
- **Main (CPCB):** mean 145, max 430
- **USP (RAPI):** mean 209; mean RAPI−CPCB divergence 63.8
- category cells: {'Moderate': 384, 'Satisfactory': 319, 'Poor': 129, 'Very Poor': 61, 'Severe': 4}


## HCHO hotspots (Change 5)
- PHV 4.7% of cells (42 HVA); Gi* 272 cells; 22 clusters; attribution {'biogenic': 8, 'other': 7, 'industrial': 3, 'urban': 3, 'agri_burning': 1}


## Transport
- Delhi 48h back-trajectory: 17 points, 47 fires within 150 km of path


## Artifacts
- `outputs/maps/` CPCB + RAPI + divergence + PM2.5 + HCHO + fire maps
- `outputs/figures/` wind rose
- `outputs/*.csv` hotspots, trajectory

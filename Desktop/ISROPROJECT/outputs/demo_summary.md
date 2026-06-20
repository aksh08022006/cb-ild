# Demo run summary

_Synthetic India data; demonstrates the full pipeline end-to-end._

- Training rows: **7,200** | features: **36**


## Surface-pollutant skill (temporal hold-out)

| Pollutant | RF R² | RF RMSE | XGB R² |
|---|---|---|---|
| pm25 | 0.862 | 14.86 | 0.867 |
| pm10 | 0.836 | 27.94 | 0.834 |
| no2_obs | 0.927 | 6.31 | 0.926 |
| so2_obs | 0.233 | 7.85 | 0.165 |
| o3_obs | 0.472 | 8.52 | 0.467 |
| co_obs | 0.615 | 0.43 | 0.605 |

## PM2.5 CV (random vs spatial vs temporal)
- random **0.792**, spatial **-0.101**, temporal **0.862** (spatial < random confirms autocorrelation leakage — Wang 2023).


## CNN-LSTM (val)

pm25 R²=0.81, pm10 R²=0.79, no2_obs R²=0.91, so2_obs R²=0.08, o3_obs R²=0.27, co_obs R²=0.58


## AQI (2021-11-13)
mean 159, max 411; category cells: {'Moderate': 1503, 'Satisfactory': 1058, 'Poor': 895, 'Very Poor': 196, 'Severe': 1, 'Good': 1}


## HCHO hotspots
PHV 2.8% of cells (102 HVA); Gi* 1047 cells; DBSCAN 15 clusters; attribution {'other': 6, 'biogenic': 4, 'industrial': 3, 'agri_burning': 1, 'urban': 1}


## HCHO-O3
r=0.42; best lag 7d (r=-0.16); FNR regimes {'VOC-limited': 5694, 'NOx-limited': 851, 'transition': 655}


## Transport
Delhi 48h back-trajectory: 17 points, 741 fires within 150 km of path


## SHAP top PM2.5 drivers
{'aod': 25.714, 'no2': 3.644, 'precipitation': 3.472, 'blh': 3.235, 'lc_tree': 2.435, 'pressure': 1.874, 'lc_built': 1.546, 'lc_crop': 1.503}


## Artifacts
- `outputs/maps/` AQI + PM2.5 + HCHO + fire maps
- `outputs/figures/` HCHO-O3 scatter, wind rose, SHAP importance
- `outputs/*.csv` hotspots, trajectory, importances

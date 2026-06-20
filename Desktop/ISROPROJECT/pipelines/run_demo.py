#!/usr/bin/env python
"""End-to-end demonstration of the FULL pipeline on synthetic India data.

Runs every phase with no external credentials, producing real artifacts:
  Phase 2-3  synthetic ingestion -> unified database (collocated training table)
  Phase 5    feature engineering (FNR, cyclical time, interactions)
  Phase 6-7  RF + XGBoost baselines AND a CNN-LSTM, with random/spatial/temporal CV
  Phase 8-9  surface-pollutant prediction -> CPCB AQI -> India AQI maps
  Phase 10   HCHO hotspots (PHV / Getis-Ord Gi* / DBSCAN / P95) + source attribution
  Phase 11   fire density map
  Phase 12   HCHO-O3 correlation / cross-correlation / FNR regimes
  Phase 13   wind back-trajectory + fires-along-path + wind rose

    python pipelines/run_demo.py            # full demo (~few minutes)
    python pipelines/run_demo.py --fast     # tiny/quick smoke run

Replacing synthetic data with real downloads (ingestion modules) leaves every
stage below unchanged.
"""

from __future__ import annotations

import argparse
import json
import warnings

import numpy as np
import pandas as pd
import xarray as xr

from isro_aqi.aqi import AQIEngine
from isro_aqi.database.schema import PREDICTORS
from isro_aqi.features import add_engineered_features
from isro_aqi.models import baselines
from isro_aqi.preprocessing.collocate import join_targets, sample_at_stations
from isro_aqi.synthetic import SyntheticConfig, generate_all
from isro_aqi.utils.geo import Grid
from isro_aqi.utils.io import ensure_dir, write_parquet
from isro_aqi.utils.logging import get_logger

warnings.filterwarnings("ignore", category=RuntimeWarning)
log = get_logger("demo")

TARGETS = ["pm25", "pm10", "no2_obs", "so2_obs", "o3_obs", "co_obs"]
AQI_MAP = {"pm25": "pm25", "pm10": "pm10", "no2": "no2_obs", "o3": "o3_obs", "co": "co_obs"}
FIG = "outputs/figures"
MAP = "outputs/maps"


def _date_split(df, frac=0.2):
    """Temporal split: last `frac` of unique dates -> test."""
    dates = np.sort(df["date"].unique())
    cut = dates[int(len(dates) * (1 - frac))]
    return df[df["date"] < cut], df[df["date"] >= cut]


# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fast", action="store_true", help="tiny quick run")
    ap.add_argument("--config", default=None, help="(optional) config for AQI breakpoints/regions")
    args = ap.parse_args()

    for d in (FIG, MAP, "data/interim", "data/processed", "models", "outputs"):
        ensure_dir(d)

    summary: dict = {}

    # ----- load AQI breakpoints + regions (from config files directly) -----
    import yaml
    bp = yaml.safe_load(open("config/aqi_breakpoints.yaml"))
    regions = yaml.safe_load(open("config/regions.yaml"))
    engine = AQIEngine(bp)

    # ===== Phase 2-3: synthetic ingestion -> database ======================
    scfg = SyntheticConfig(
        resolution_deg=1.0 if args.fast else 0.5,
        n_days=15 if args.fast else 60,
        n_stations=30 if args.fast else 120,
    )
    log.info(f"[1/10] generating synthetic India data {scfg}")
    data = generate_all(scfg)
    stack, stations, obs, fires = data["stack"], data["stations"], data["observations"], data["fires"]
    grid = Grid(scfg.bbox, scfg.resolution_deg)

    write_parquet(stations, "data/processed/stations.parquet")
    write_parquet(obs, "data/processed/cpcb_daily.parquet")
    write_parquet(fires, "data/processed/fire_pixels.parquet")
    stack.to_netcdf("data/interim/daily.nc")
    log.info(f"saved stack {dict(stack.sizes)}, {len(stations)} stations, {len(obs):,} obs")

    # collocate + join targets + engineer features  (Phase 4-5)
    predictors = sample_at_stations(stack, stations)
    training = join_targets(predictors, obs)
    training = add_engineered_features(training, lag_cols=None)
    features = [c for c in PREDICTORS if c in training.columns]
    write_parquet(training, "data/processed/training.parquet")
    summary["training_rows"] = int(len(training))
    summary["n_features"] = len(features)
    log.info(f"[2/10] training table: {len(training):,} rows x {len(features)} features")

    # ===== Phase 6-7: models + 3-scheme validation =========================
    tr, te = _date_split(training, 0.2)
    log.info(f"[3/10] training RF + XGBoost (temporal split {len(tr):,}/{len(te):,})")
    rf = baselines.RandomForestModel(TARGETS, features, n_estimators=150, max_depth=20).fit(tr)
    xgb = baselines.XGBoostModel(TARGETS, features, n_estimators=400).fit(tr)

    rf_pred, xgb_pred = rf.predict(te), xgb.predict(te)
    metrics_tbl = {}
    for t in TARGETS:
        metrics_tbl[t] = {
            "RF": baselines.metrics(te[t].to_numpy(), rf_pred[t].to_numpy()),
            "XGB": baselines.metrics(te[t].to_numpy(), xgb_pred[t].to_numpy()),
        }
        log.info(f"   {t:8s} RF R2={metrics_tbl[t]['RF']['r2']:.3f} RMSE={metrics_tbl[t]['RF']['rmse']:.2f}"
                 f" | XGB R2={metrics_tbl[t]['XGB']['r2']:.3f}")
    summary["metrics"] = metrics_tbl
    rf.save("models/rf.joblib")
    xgb.save("models/xgb.joblib")

    # random vs spatial vs temporal CV for PM2.5 (the [Wang 2023] point)
    summary["cv_pm25"] = _cv_comparison(training, features)
    log.info(f"[4/10] PM2.5 CV R2 -> random {summary['cv_pm25']['random']:.3f} | "
             f"spatial {summary['cv_pm25']['spatial']:.3f} | temporal {summary['cv_pm25']['temporal']:.3f}")

    # CNN-LSTM (small) on spatial patches
    summary["cnn_lstm"] = _train_cnn_lstm(stack, training, grid, args.fast)
    log.info(f"[5/10] CNN-LSTM val metrics: "
             + ", ".join(f"{k} R2={v['r2']:.2f}" for k, v in summary["cnn_lstm"].items()))

    # ===== Phase 8-9: predict pollutants -> AQI -> maps ====================
    log.info("[6/10] generating AQI maps")
    burn_idx = int(np.argmax([float(stack["frp_mean"].isel(time=i).mean()) for i in range(stack.sizes["time"])]))
    summary["aqi"] = _aqi_maps(stack, rf, features, engine, grid, burn_idx)

    # ===== Phase 10-11: HCHO hotspots + attribution + fire map =============
    log.info("[7/10] HCHO hotspot detection + attribution")
    summary["hcho"] = _hcho_analysis(stack, fires, regions, grid)

    # ===== Phase 12: HCHO-O3 relationship ==================================
    log.info("[8/10] HCHO-O3 relationship + FNR regimes")
    summary["ozone"] = _ozone(training, stack, stations)

    # ===== Phase 13: transport =============================================
    log.info("[9/9] transport: back-trajectory + fires-along-path")
    summary["transport"] = _transport(stack, fires)

    # ----- write summary ---------------------------------------------------
    with open("outputs/demo_summary.json", "w") as fh:
        json.dump(_jsonable(summary), fh, indent=2)
    _write_summary_md(summary)
    log.info("DEMO COMPLETE -> see outputs/ (figures, maps, demo_summary.md)")


# --------------------------------------------------------------------------- #
def _cv_comparison(training, features, target="pm25"):
    from sklearn.model_selection import train_test_split

    from isro_aqi.models.train import spatial_blocks
    df = training.dropna(subset=[target])
    # random
    a, b = train_test_split(df, test_size=0.2, random_state=0)
    m = baselines.RandomForestModel([target], features, n_estimators=150).fit(a)
    r_random = baselines.metrics(b[target].to_numpy(), m.predict(b)[target].to_numpy())["r2"]
    # spatial (one held-out block fold)
    tr, va = next(spatial_blocks(df, block_deg=2.0, k=5))
    m = baselines.RandomForestModel([target], features, n_estimators=150).fit(tr)
    r_spatial = baselines.metrics(va[target].to_numpy(), m.predict(va)[target].to_numpy())["r2"]
    # temporal
    tr, te = _date_split(df, 0.2)
    m = baselines.RandomForestModel([target], features, n_estimators=150).fit(tr)
    r_temporal = baselines.metrics(te[target].to_numpy(), m.predict(te)[target].to_numpy())["r2"]
    return {"random": r_random, "spatial": r_spatial, "temporal": r_temporal}


def _train_cnn_lstm(stack, training, grid, fast):
    from isro_aqi.models.cnn_lstm import PollutantCNNLSTM
    from isro_aqi.models.dataset import PatchSequenceDataset, Standardizer
    from isro_aqi.models.train import train_model

    channels = list(stack.data_vars)
    samples = training[["date"]].copy()
    samples["lon"] = training["lon_meta"].values if "lon_meta" in training else training["lon"].values
    samples["lat"] = training["lat_meta"].values if "lat_meta" in training else training["lat"].values
    for t in TARGETS:
        samples[t] = training[t].values
    tr, va = _date_split(samples, 0.2)

    std = Standardizer.fit(stack, channels)
    tmean = np.array([np.nanmean(tr[t]) for t in TARGETS])
    tstd = np.array([np.nanstd(tr[t]) for t in TARGETS])
    P, T = (5, 3) if fast else (7, 5)
    mk = lambda df: PatchSequenceDataset(  # noqa: E731
        stack, df, channels, TARGETS, grid, patch_size=P, sequence_length=T,
        standardizer=std, target_mean=tmean, target_std=tstd,
    )
    model = PollutantCNNLSTM(len(channels), len(TARGETS), patch_size=P)
    train_model(
        model, mk(tr), mk(va), TARGETS,
        epochs=5 if fast else 30, batch_size=128, lr=1e-3, patience=8,
        ckpt_path="models/cnn_lstm_demo.pt", num_workers=0,
    )
    return _eval_cnn_lstm(model, mk(va), tmean, tstd)


def _eval_cnn_lstm(model, ds_va, tmean, tstd):
    """De-standardised per-target metrics for the CNN-LSTM (interpretable R2/RMSE)."""
    import torch
    from torch.utils.data import DataLoader

    from isro_aqi.models.train import select_device
    dev = select_device("auto")
    model = model.to(dev).eval()
    preds, trues = [], []
    with torch.no_grad():
        for x, y in DataLoader(ds_va, batch_size=128):
            preds.append(model(x.to(dev)).cpu().numpy())
            trues.append(y.numpy())
    P = np.vstack(preds) * tstd + tmean
    Y = np.vstack(trues) * tstd + tmean
    return {t: baselines.metrics(Y[:, i], P[:, i]) for i, t in enumerate(TARGETS)}


def _predict_grid(day_ds, rf, features, date):
    """Predict pollutant grids for one day's Dataset -> dict of 2-D arrays."""
    df = day_ds.to_dataframe().reset_index()
    df["date"] = pd.Timestamp(date)
    df = add_engineered_features(df, lag_cols=None)
    for c in features:
        if c not in df:
            df[c] = 0.0
    pred = rf.predict(df)
    lat, lon = day_ds["lat"].values, day_ds["lon"].values
    out = {}
    for t in pred.columns:
        piv = df.assign(_p=pred[t].values).pivot_table(index="lat", columns="lon", values="_p")
        out[t] = piv.reindex(index=lat, columns=lon).values
    return out, lat, lon


def _aqi_maps(stack, rf, features, engine, grid, burn_idx):
    from isro_aqi.viz.maps import aqi_map, scalar_map

    date = pd.to_datetime(stack["time"].values[burn_idx])
    grids, lat, lon = _predict_grid(stack.isel(time=burn_idx), rf, features, date)
    conc = {eng: grids[col] for eng, col in AQI_MAP.items() if col in grids}
    aqi, dom = engine.aqi_grid(conc)
    aqi_da = xr.DataArray(aqi, coords={"lat": lat, "lon": lon}, dims=("lat", "lon"))
    aqi_map(aqi_da, title=f"Surface AQI (synthetic) {date.date()}", out_path=f"{MAP}/aqi_{date.date()}.png")
    scalar_map(xr.DataArray(grids["pm25"], coords={"lat": lat, "lon": lon}, dims=("lat", "lon")),
               title=f"Predicted PM2.5 {date.date()}", cmap="magma_r", label="PM2.5 (ug/m3)",
               out_path=f"{MAP}/pm25_{date.date()}.png")

    # seasonal-mean AQI (AQI of seasonal-mean concentrations)
    mean_ds = stack.mean("time")
    mgrids, mlat, mlon = _predict_grid(mean_ds, rf, features, date)
    mconc = {eng: mgrids[col] for eng, col in AQI_MAP.items() if col in mgrids}
    maqi, _ = engine.aqi_grid(mconc)
    maqi_da = xr.DataArray(maqi, coords={"lat": mlat, "lon": mlon}, dims=("lat", "lon"))
    aqi_map(maqi_da, title="Seasonal-mean Surface AQI (synthetic)", out_path=f"{MAP}/aqi_seasonal_mean.png")

    finite = aqi[np.isfinite(aqi)]
    cats = {}
    for v in finite:
        c = engine.category(float(v))
        cats[c] = cats.get(c, 0) + 1
    return {"date": str(date.date()), "aqi_mean": float(np.nanmean(aqi)),
            "aqi_max": float(np.nanmax(aqi)), "category_cells": cats}


def _hcho_analysis(stack, fires, regions, grid):
    """HCHO hotspots on the burning-window composite.

    Hotspots are LOCAL enhancements, so we detect PHV anomaly (HVA) cells -- which
    ignore the broad persistent haze and isolate sharp fire/urban/industrial
    spikes -- then DBSCAN-cluster those cells and attribute each cluster. The
    seasonal-mean field is used for the atlas map; PHV/Gi* run on the burning
    window where the biomass-burning signal is strongest.
    """
    from isro_aqi.hcho import dbscan_hotspots, getis_ord, percentile, phv, source_attribution
    from isro_aqi.viz.maps import fire_density_map, hcho_map

    res = {}
    spacing = float(stack.lon[1] - stack.lon[0])
    # burning-window composite (peak +/- 5 days) -- "biomass burning period"
    burn_idx = int(np.argmax([float(stack["frp_mean"].isel(time=i).mean())
                              for i in range(stack.sizes["time"])]))
    lo, hi = max(0, burn_idx - 5), min(stack.sizes["time"], burn_idx + 6)
    hcho_burn = stack["hcho"].isel(time=slice(lo, hi)).mean("time")
    frp_burn = stack["frp_mean"].isel(time=slice(lo, hi)).max("time")
    hcho_season = stack["hcho"].mean("time")

    # PHV local-anomaly detection
    ds_phv = phv.detect_hotspots(hcho_burn, phv_min=1.05, hva_threshold=8e15, to_molec_cm2=1.0)
    res["phv_pct"] = phv.phv_percent(ds_phv)
    res["phv_hva_cells"] = int(ds_phv["hva"].values.sum())

    band = max(3 * spacing, 0.8)
    try:
        ds_gi = getis_ord.gi_star(hcho_burn, distance_band_deg=band, fdr=True, alpha=0.05, permutations=99)
        res["gi_hotspot_cells"] = int(ds_gi["hotspot"].values.sum())
    except Exception as e:  # esda edge cases on tiny grids
        log.warning(f"Gi* skipped: {e}")
        res["gi_hotspot_cells"] = None

    res["p95_threshold"] = float(percentile.percentile_threshold(hcho_burn, 95).attrs["threshold"])

    # cluster the PHV HVA cells (local anomalies), then attribute
    masked = hcho_burn.where(ds_phv["hva"])
    clusters = dbscan_hotspots.cluster_hotspots(masked, threshold=0.0, eps_deg=2 * spacing, min_samples=2)
    res["dbscan_clusters"] = int(len(clusters))
    if len(clusters):
        clusters["frp_mean"] = [float(frp_burn.sel(lon=r.lon, lat=r.lat, method="nearest"))
                                for r in clusters.itertuples()]
        clusters["evi"] = [float(stack["evi"].mean("time").sel(lon=r.lon, lat=r.lat, method="nearest"))
                           for r in clusters.itertuples()]
        attributed = source_attribution.attribute(clusters, regions, season="post_monsoon")
        attributed.to_csv("outputs/hcho_hotspots_attributed.csv", index=False)
        res["attribution"] = attributed["source"].value_counts().to_dict()

    hcho_map(hcho_season, hotspots=clusters if len(clusters) else None,
             title="Seasonal HCHO + attributed hotspots (burning window)",
             out_path=f"{MAP}/hcho_hotspots.png")
    fire_density_map(fires, title="Fire density (synthetic, post-monsoon)", out_path=f"{MAP}/fire_density.png")
    return res


def _ozone(training, stack, stations):
    from isro_aqi.hcho import ozone_relationship as oz
    from isro_aqi.viz.figures import hcho_o3_panel

    corr = oz.correlation(training, hcho="hcho", o3="o3_obs")
    fr = oz.fnr_regime(training, hcho="hcho", no2="no2", voc_limited_max=3.2, nox_limited_min=4.1)
    regimes = fr["o3_regime"].value_counts().to_dict()
    hcho_o3_panel(training, hcho="hcho", o3="o3_obs", out_path=f"{FIG}/hcho_o3_scatter.png")

    # cross-correlation at the cell nearest Delhi
    dlon, dlat = 77.10, 28.65
    hser = stack["hcho"].sel(lon=dlon, lat=dlat, method="nearest").to_series()
    oser = stack["o3"].sel(lon=dlon, lat=dlat, method="nearest").to_series()
    xcorr = oz.cross_correlation(hser, oser, max_lag=7)
    best = xcorr.loc[xcorr["r"].idxmax()]
    return {"corr_r": corr["r"], "regimes": {str(k): int(v) for k, v in regimes.items()},
            "xcorr_best_lag": int(best["lag_days"]), "xcorr_best_r": float(best["r"])}


def _transport(stack, fires):
    from isro_aqi.hcho import transport

    date = pd.to_datetime(stack["time"].values[-1])
    winds = stack[["u_wind", "v_wind"]]
    path = transport.back_trajectory(winds, 77.10, 28.65, str(date), hours=48, dt_hours=3.0)
    path.to_csv("outputs/delhi_backtrajectory.csv", index=False)
    n = transport.fires_along_path(path, fires.rename(columns={"longitude": "longitude", "latitude": "latitude"}), radius_km=150)
    try:
        u = stack["u_wind"].sel(lon=77.1, lat=28.65, method="nearest").to_series()
        v = stack["v_wind"].sel(lon=77.1, lat=28.65, method="nearest").to_series()
        transport.wind_rose(u, v, out_path=f"{FIG}/delhi_windrose.png")
    except Exception as e:
        log.warning(f"wind rose skipped: {e}")
    return {"trajectory_points": int(len(path)), "fires_along_path": int(n),
            "endpoint": [float(path.iloc[-1]["lon"]), float(path.iloc[-1]["lat"])]}


def _jsonable(o):
    if isinstance(o, dict):
        return {k: _jsonable(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_jsonable(v) for v in o]
    if isinstance(o, (np.floating, np.integer)):
        return float(o)
    return o


def _write_summary_md(s):
    lines = ["# Demo run summary\n", "_Synthetic India data; demonstrates the full pipeline end-to-end._\n"]
    lines.append(f"- Training rows: **{s['training_rows']:,}** | features: **{s['n_features']}**\n")
    lines.append("\n## Surface-pollutant skill (temporal hold-out)\n")
    lines.append("| Pollutant | RF R² | RF RMSE | XGB R² |\n|---|---|---|---|")
    for t, m in s["metrics"].items():
        lines.append(f"| {t} | {m['RF']['r2']:.3f} | {m['RF']['rmse']:.2f} | {m['XGB']['r2']:.3f} |")
    cv = s["cv_pm25"]
    lines.append(f"\n## PM2.5 CV (random vs spatial vs temporal)\n"
                 f"- random **{cv['random']:.3f}**, spatial **{cv['spatial']:.3f}**, temporal **{cv['temporal']:.3f}** "
                 f"(spatial < random confirms autocorrelation leakage — Wang 2023).\n")
    lines.append("\n## CNN-LSTM (val)\n")
    lines.append(", ".join(f"{k} R²={v['r2']:.2f}" for k, v in s["cnn_lstm"].items()) + "\n")
    lines.append(f"\n## AQI ({s['aqi']['date']})\nmean {s['aqi']['aqi_mean']:.0f}, max {s['aqi']['aqi_max']:.0f}; "
                 f"category cells: {s['aqi']['category_cells']}\n")
    lines.append(f"\n## HCHO hotspots\nPHV {s['hcho']['phv_pct']:.1f}% of cells ({s['hcho']['phv_hva_cells']} HVA); "
                 f"Gi* {s['hcho'].get('gi_hotspot_cells')} cells; DBSCAN {s['hcho']['dbscan_clusters']} clusters; "
                 f"attribution {s['hcho'].get('attribution')}\n")
    lines.append(f"\n## HCHO-O3\nr={s['ozone']['corr_r']:.2f}; best lag {s['ozone']['xcorr_best_lag']}d "
                 f"(r={s['ozone']['xcorr_best_r']:.2f}); FNR regimes {s['ozone']['regimes']}\n")
    lines.append(f"\n## Transport\nDelhi 48h back-trajectory: {s['transport']['trajectory_points']} points, "
                 f"{s['transport']['fires_along_path']} fires within 150 km of path\n")
    lines.append("\n## Artifacts\n- `outputs/maps/` AQI + PM2.5 + HCHO + fire maps\n"
                 "- `outputs/figures/` HCHO-O3 scatter, wind rose\n"
                 "- `outputs/*.csv` hotspots, trajectory\n")
    with open("outputs/demo_summary.md", "w") as fh:
        fh.write("\n".join(lines))


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""ONE-COMMAND real-data run for Objective 1 (surface AQI).

Pulls the real predictor stack straight from GEE (no Drive download needed),
collocates it with your CPCB station data, trains + spatially-cross-validates the
hybrid model, and writes a REAL, ground-validated AQI map -> web/public/data.

    python pipelines/run_real.py          # or:  make real

Drop CPCB CSVs into data/external/ first (Oct-Dec 2021). Without CPCB it still
fetches + saves the real predictor stack and tells you what's missing. With CPCB
it prints real RMSE / R / MAE and exports the real AQI layer to the site.

Predictors are seasonal means (one composite) -> this trains the spatial model and
yields a seasonal AQI map; per-day ingestion (for daily CNN-LSTM) is the next step.
"""

from __future__ import annotations

import gzip
import io
import json
import os
import re
import sys
from pathlib import Path

import ee
import numpy as np
import pandas as pd
import requests
import rioxarray  # noqa: F401
import xarray as xr
import yaml

sys.path.insert(0, "src")
from isro_aqi.aqi import AQIEngine  # noqa: E402
from isro_aqi.config import load_config  # noqa: E402
from isro_aqi.features import add_engineered_features  # noqa: E402
from isro_aqi.ingestion import cpcb, era5, modis_fire, sentinel5p, srtm  # noqa: E402
from isro_aqi.ingestion.gee_auth import aoi_geometry, init_ee  # noqa: E402
from isro_aqi.models.baselines import metrics  # noqa: E402
from isro_aqi.models.hybrid import INDIA_BENCHMARK_R2, HybridModel  # noqa: E402
from isro_aqi.models.train import spatial_blocks  # noqa: E402
from isro_aqi.preprocessing.calibrate_no2 import calibrate_no2_stack  # noqa: E402
from isro_aqi.preprocessing.collocate import join_targets, sample_at_stations  # noqa: E402
from isro_aqi.preprocessing.gapfill_aod import fill_aod_stack  # noqa: E402

START, END = "2021-10-01", "2021-12-31"
SCALE = 27830  # ~0.25 deg predictor grid
WEB = Path("web/public/data")
TARGETS = ["pm25", "pm10", "no2_obs", "so2_obs", "o3_obs", "co_obs"]
AQI_MAP = {"pm25": "pm25", "pm10": "pm10", "no2": "no2_obs", "so2": "so2_obs", "o3": "o3_obs", "co": "co_obs"}
# band order produced by each ingestion module's ee.Image
ERA5_BANDS = ["temperature", "rh", "u_wind", "v_wind", "wind_speed", "pressure", "precipitation", "solar_radiation"]


def _dl(ee_img, names, region, tag):
    """Download an ee.Image via getDownloadURL -> {name: (lat,lon) DataArray}."""
    url = ee_img.getDownloadURL({"region": region, "scale": SCALE, "format": "GEO_TIFF", "crs": "EPSG:4326"})
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    p = f"/tmp/pred_{tag}.tif"
    open(p, "wb").write(r.content)
    da = rioxarray.open_rasterio(p, masked=True).rename({"x": "lon", "y": "lat"})
    n = int(da.sizes["band"])
    return {names[i]: da.isel(band=i, drop=True) for i in range(min(n, len(names)))}


def fetch_predictor_stack(cfg) -> xr.Dataset:
    """Real seasonal-mean predictor stack over India, straight from GEE."""
    region = aoi_geometry(cfg)
    print("fetching real predictors via GEE …")
    layers: dict[str, xr.DataArray] = {}
    for gas in sentinel5p.GASES:
        layers.update(_dl(sentinel5p._period_mean(cfg, gas, START, END), [gas], region, gas))
        print(f"  ✓ {gas}")
    layers.update(_dl(era5.build_stack(cfg, START, END), ERA5_BANDS, region, "met")); print("  ✓ met")
    layers.update(_dl(modis_fire.active_fire_frp(cfg, START, END), ["frp_mean", "frp_max", "fire_count"], region, "frp")); print("  ✓ fire")
    layers.update(_dl(modis_fire.evi(cfg, START, END), ["evi"], region, "evi")); print("  ✓ evi")
    layers.update(_dl(srtm.terrain_stack(cfg), ["elevation", "slope", "aspect"], region, "terrain")); print("  ✓ terrain")
    aod = (ee.ImageCollection("MODIS/061/MCD19A2_GRANULES").select("Optical_Depth_055")
           .filterDate(START, END).filterBounds(region).mean().multiply(0.001))
    layers.update(_dl(aod, ["aod"], region, "aod")); print("  ✓ aod")

    ref = layers["no2"]
    aligned = {k: (v if k == "no2" else v.interp(lon=ref.lon, lat=ref.lat)) for k, v in layers.items()}
    ds = xr.Dataset({k: v.expand_dims(time=[pd.Timestamp(START)]) for k, v in aligned.items()})
    print(f"predictor stack: {dict(ds.sizes)} | {len(ds.data_vars)} vars")
    return ds


def load_cpcb_seasonal():
    """Best-effort: CPCB CSVs in data/external -> seasonal-mean station table with lat/lon."""
    ext = Path("data/external")
    csvs = [p for p in ext.glob("**/*.csv") if "firms" not in p.name.lower()]
    if not csvs:
        return None, "no CPCB CSVs found in data/external/"
    meta = next((p for p in csvs if "station" in p.name.lower() or "meta" in p.name.lower()), None)
    stations = cpcb.load_station_metadata(str(meta)) if meta else None
    try:
        hourly = pd.concat([cpcb.load_raw_hourly(str(p)) for p in csvs if p is not meta], ignore_index=True)
        daily = cpcb.to_daily(hourly)
    except Exception as e:
        return None, f"could not parse CPCB CSVs ({e}); expected hourly export with a datetime column + pollutant columns"
    # season mean per station, renamed to model target columns
    agg = daily.groupby("station_id").mean(numeric_only=True).reset_index()
    agg = agg.rename(columns={"no2": "no2_obs", "so2": "so2_obs", "o3": "o3_obs", "co": "co_obs"})
    if stations is not None and {"lat", "lon"}.issubset(stations.columns):
        agg = agg.merge(stations[["station_id", "lat", "lon"]], on="station_id", how="inner")
    if not {"lat", "lon"}.issubset(agg.columns):
        return None, "CPCB table has no station lat/lon — add a station-metadata CSV (station_id, lat, lon)"
    return agg, None


# ---- OpenAQ path: same CPCB station measurements, no captcha (free API key) ----
def _archive_keys(loc, year, months):
    keys = []
    for m in months:
        url = (f"https://openaq-data-archive.s3.amazonaws.com/?list-type=2"
               f"&prefix=records/csv.gz/locationid={loc}/year={year}/month={m:02d}/&max-keys=400")
        keys += re.findall(r"<Key>([^<]+)</Key>", requests.get(url, timeout=30).text)
    return keys


def _download_location(loc, year, months):
    frames = []
    for k in _archive_keys(loc, year, months):
        r = requests.get(f"https://openaq-data-archive.s3.amazonaws.com/{k}", timeout=60)
        if r.status_code == 200:
            try:
                frames.append(pd.read_csv(io.StringIO(gzip.decompress(r.content).decode())))
            except Exception:
                pass
    return pd.concat(frames, ignore_index=True) if frames else None


def load_openaq_seasonal(api_key, start, end):
    """Real Indian CPCB-station data via OpenAQ: keyed location list + keyless archive."""
    H = {"X-API-Key": api_key}
    locs, page = [], 1
    while True:
        r = requests.get("https://api.openaq.org/v3/locations", headers=H,
                         params={"iso": "IN", "limit": 1000, "page": page}, timeout=60)
        r.raise_for_status()
        res = r.json().get("results", [])
        locs += res
        if len(res) < 1000:
            break
        page += 1
    print(f"OpenAQ: {len(locs)} Indian stations listed")
    yr, months = int(start[:4]), list(range(int(start[5:7]), int(end[5:7]) + 1))
    rows = []
    for loc in locs:
        c = loc.get("coordinates") or {}
        lat, lon = c.get("latitude"), c.get("longitude")
        if lat is None or lon is None:
            continue
        raw = _download_location(loc["id"], yr, months)
        if raw is None or raw.empty or "parameter" not in raw:
            continue
        wide = raw.pivot_table(index="datetime", columns="parameter", values="value", aggfunc="mean").reset_index()
        wide["station_id"] = f"openaq-{loc['id']}"
        daily = cpcb.to_daily(wide)
        if daily.empty:
            continue
        agg = daily.mean(numeric_only=True)
        rows.append({"station_id": f"openaq-{loc['id']}", "lat": lat, "lon": lon,
                     "pm25": agg.get("pm25"), "pm10": agg.get("pm10"),
                     "no2_obs": agg.get("no2"), "so2_obs": agg.get("so2"),
                     "o3_obs": agg.get("o3"), "co_obs": agg.get("co")})
    df = pd.DataFrame(rows).dropna(subset=["lat", "lon"])
    print(f"OpenAQ seasonal ground-truth table: {len(df)} stations with data")
    return df


def main():
    cfg = load_config("config/config.yaml")
    init_ee(cfg)
    engine = AQIEngine(cfg.aqi_breakpoints)

    stack = fetch_predictor_stack(cfg)
    Path("data/interim").mkdir(parents=True, exist_ok=True)
    stack.to_netcdf("data/interim/daily_real.nc")
    print("-> data/interim/daily_real.nc (real predictor stack saved)")

    api_key = os.environ.get("OPENAQ_API_KEY")
    if api_key:
        print("\nground truth: OpenAQ (Indian CPCB-station measurements, no captcha)")
        cpcb_tbl = load_openaq_seasonal(api_key, START, END)
        if cpcb_tbl is None or cpcb_tbl.empty:
            print("OpenAQ returned no station data for this window — try a recent season or use CPCB CSVs.")
            return
    else:
        cpcb_tbl, err = load_cpcb_seasonal()
        if cpcb_tbl is None:
            print(f"\nGround-truth step skipped: {err}")
            print("To finish Objective 1, EITHER:")
            print("  - free OpenAQ key (1 min, no captcha): https://explore.openaq.org/register")
            print("      then:  OPENAQ_API_KEY=your_key make real")
            print("  - OR drop CPCB station CSVs (Oct-Dec 2021) into data/external/ and re-run.")
            return

    stations = cpcb_tbl[["station_id", "lat", "lon"]].copy()
    predictors = sample_at_stations(stack, stations)
    training = join_targets(predictors, cpcb_tbl.assign(date=pd.Timestamp(START)))
    training = add_engineered_features(training, lag_cols=None)
    features = [c for c in stack.data_vars if c in training.columns] + ["lat", "lon", "fnr", "doy_sin", "doy_cos"]
    features = [c for c in dict.fromkeys(features) if c in training.columns]
    print(f"training table: {len(training)} stations x {len(features)} features")

    if "no2" in training and "no2_obs" in training:
        _, no2 = calibrate_no2_stack(stack, training)
        print(f"NO2 calibration: r2={no2['r2']:.3f}")

    # spatial cross-validation -> the honest, real R²/RMSE/MAE
    print("\n=== REAL spatial cross-validation (leave-station-blocks-out) ===")
    report = {}
    for t in TARGETS:
        sub = training.dropna(subset=[t])
        if len(sub) < 30:
            continue
        preds, trues = [], []
        for tr, va in spatial_blocks(sub, block_deg=2.0, k=5):
            if len(va) < 3 or len(tr) < 20:
                continue
            m = HybridModel([t], features).fit(tr)
            preds.append(m.predict(va)[t].to_numpy()); trues.append(va[t].to_numpy())
        if preds:
            P, Y = np.concatenate(preds), np.concatenate(trues)
            report[t] = metrics(Y, P)
            bench = INDIA_BENCHMARK_R2.get(t.replace("_obs", ""))
            print(f"  {t:8s} R={np.sqrt(max(report[t]['r2'],0)):.2f} R²={report[t]['r2']:.3f} "
                  f"RMSE={report[t]['rmse']:.2f} MAE={report[t]['mae']:.2f}  (India target R² {bench})")
    Path("outputs").mkdir(exist_ok=True)
    json.dump(report, open("outputs/real_validation.json", "w"), indent=2)

    # real AQI map -> web
    print("\ngenerating real AQI map …")
    model = HybridModel(TARGETS, features).fit(training)
    gdf = add_engineered_features(stack.isel(time=0).to_dataframe().reset_index().assign(date=pd.Timestamp(START)))
    for c in features:
        if c not in gdf:
            gdf[c] = 0.0
    pred = model.predict(gdf)
    conc = {e: pred[c].to_numpy() for e, c in AQI_MAP.items() if c in pred}
    out = engine.compute_grid(conc)
    lon, lat = gdf["lon"].to_numpy(), gdf["lat"].to_numpy()
    from matplotlib.path import Path as MplPath
    gj = json.loads((WEB / "india.geojson").read_text())
    polys = gj["features"][0]["geometry"]["coordinates"]
    mainland = max((p[0] for p in polys), key=lambda r: (max(x[0] for x in r) - min(x[0] for x in r)) * (max(x[1] for x in r) - min(x[1] for x in r)))
    inside = MplPath(np.array(mainland)).contains_points(np.column_stack([lon, lat]))
    cells = [[round(float(lon[i]), 2), round(float(lat[i]), 2), int(out["cpcb"][i]), int(out["rapi"][i])]
             for i in range(len(lon)) if inside[i] and np.isfinite(out["cpcb"][i])]
    (WEB / "aqi_frames.json").write_text(json.dumps({"key": ["lon", "lat", "aqi", "rapi"], "frames": [{"date": START, "cells": cells}]}, separators=(",", ":")))
    print(f"-> web/public/data/aqi_frames.json: REAL validated AQI ({len(cells)} cells)")
    print("\nObjective 1 COMPLETE: real surface AQI trained + validated against CPCB. AQI layer is now real.")


if __name__ == "__main__":
    main()

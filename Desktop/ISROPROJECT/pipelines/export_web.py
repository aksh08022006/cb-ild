#!/usr/bin/env python
"""Export real pipeline outputs to web/public/data/*.json for MapLibre + deck.gl.

Reads the trained model + the gridded stack + the HCHO hotspot / back-trajectory /
fire artifacts produced by run_demo.py and writes compact JSON the frontend renders:

  aqi_frames.json   N time frames of per-cell AQI (model -> CPCB engine)
  gas_grids.json    seasonal-mean per-cell columns for AOD/NO2/SO2/CO/O3/HCHO (0..1)
  hcho_grid.json    seasonal-mean per-cell HCHO (0..1) for the hotspot basemap
  hotspots.json     attributed HCHO hotspots (lon/lat/source/frp)
  fires.json        downsampled VIIRS-style fire pixels
  trajectory.json   Delhi 48h back-trajectory path
  india.geojson     national outline (from the coarse polygon)

Run after `make demo`:  python pipelines/export_web.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xarray as xr
import yaml
from matplotlib.path import Path as MplPath

sys.path.insert(0, "src")
from isro_aqi.aqi import AQIEngine  # noqa: E402
from isro_aqi.database.schema import PREDICTORS  # noqa: E402
from isro_aqi.features import add_engineered_features  # noqa: E402

OUT = Path("web/public/data")
OUT.mkdir(parents=True, exist_ok=True)

# coarse India polygon (matches web/lib/india.ts) for masking ocean cells
INDIA_POLY = [
    [77.0, 35.5], [78.5, 34.5], [80.0, 32.5], [81.0, 30.3], [83.5, 29.0], [85.5, 28.2],
    [88.0, 27.2], [88.8, 26.5], [89.8, 26.0], [92.0, 27.5], [94.5, 27.8], [97.0, 28.2],
    [96.5, 27.0], [95.2, 26.6], [94.0, 24.0], [93.4, 24.0], [93.0, 22.2], [91.0, 23.0],
    [89.0, 22.0], [88.0, 21.6], [87.0, 21.3], [85.8, 20.3], [84.5, 18.5], [82.5, 17.0],
    [80.3, 15.8], [80.2, 13.5], [79.8, 11.5], [78.2, 8.5], [77.5, 8.1], [76.5, 8.9],
    [75.7, 11.5], [74.7, 14.5], [73.5, 16.0], [72.9, 18.5], [72.7, 20.5], [70.5, 20.8],
    [69.0, 22.2], [68.2, 23.7], [69.5, 24.0], [70.5, 25.5], [73.0, 27.5], [74.0, 29.0],
    [75.0, 31.5], [76.0, 33.5], [77.0, 35.5],
]
_PATH = MplPath(np.array(INDIA_POLY))


def write(name: str, obj) -> None:
    p = OUT / name
    p.write_text(json.dumps(obj, separators=(",", ":")))
    print(f"  {name}: {p.stat().st_size/1024:.0f} KB")


def grid_df(day_ds: xr.Dataset, date, features):
    df = day_ds.to_dataframe().reset_index()
    df["date"] = pd.Timestamp(date)
    df = add_engineered_features(df, lag_cols=None)
    for c in features:
        if c not in df:
            df[c] = 0.0
    return df


def main():
    print("loading stack + model …")
    stack = xr.open_dataset("data/interim/daily.nc")
    rf = joblib.load("models/rf.joblib")
    features = [c for c in PREDICTORS if c in rf.features] or rf.features
    engine = AQIEngine(yaml.safe_load(open("config/aqi_breakpoints.yaml")))
    times = pd.to_datetime(stack["time"].values)
    AQI_MAP = {"pm25": "pm25", "pm10": "pm10", "no2": "no2_obs", "o3": "o3_obs", "co": "co_obs"}

    # ---- AQI time frames ------------------------------------------------
    print("predicting AQI frames …")
    idxs = np.linspace(0, len(times) - 1, 8).astype(int)
    frames = []
    for fi in idxs:
        day = stack.isel(time=int(fi))
        df = grid_df(day, times[fi], features)
        pred = rf.predict(df)
        conc = {e: pred[c].to_numpy() for e, c in AQI_MAP.items() if c in pred}
        aqi, _ = engine.aqi_grid(conc)
        lon = df["lon"].to_numpy(); lat = df["lat"].to_numpy()
        inside = _PATH.contains_points(np.column_stack([lon, lat]))
        cells = [
            [round(float(lon[i]), 2), round(float(lat[i]), 2), int(aqi[i])]
            for i in range(len(aqi))
            if inside[i] and np.isfinite(aqi[i])
        ]
        frames.append({"date": str(times[fi].date()), "cells": cells})
    write("aqi_frames.json", {"key": ["lon", "lat", "aqi"], "frames": frames})

    # ---- gas seasonal-mean grids (normalised 0..1) ----------------------
    print("exporting gas grids …")
    gases = ["aod", "no2", "so2", "co", "o3", "hcho"]
    mean = stack[gases].mean("time")
    lon2d, lat2d = np.meshgrid(stack["lon"].values, stack["lat"].values)
    lonf, latf = lon2d.ravel(), lat2d.ravel()
    inside = _PATH.contains_points(np.column_stack([lonf, latf]))
    norm = {}
    for g in gases:
        v = mean[g].values.ravel()
        vin = v[inside]
        lo, hi = np.nanpercentile(vin, 2), np.nanpercentile(vin, 98)
        norm[g] = np.clip((v - lo) / (hi - lo + 1e-12), 0, 1)
    gas_cells = [
        {"lon": round(float(lonf[i]), 2), "lat": round(float(latf[i]), 2),
         **{g: round(float(norm[g][i]), 3) for g in gases}}
        for i in range(len(lonf)) if inside[i]
    ]
    write("gas_grids.json", {"gases": gases, "cells": gas_cells})
    write("hcho_grid.json", [[c["lon"], c["lat"], c["hcho"]] for c in gas_cells])

    # ---- hotspots / fires / trajectory (real artifacts) -----------------
    print("exporting hotspots / fires / trajectory …")
    hs = pd.read_csv("outputs/hcho_hotspots_attributed.csv")
    write("hotspots.json", [
        {"lon": round(float(r.lon), 2), "lat": round(float(r.lat), 2),
         "source": str(r.source), "detail": str(getattr(r, "source_detail", "") or ""),
         "frp": round(float(r.frp_mean), 1), "n": int(r.n_cells)}
        for r in hs.itertuples()
    ])

    fires = pd.read_parquet("data/processed/fire_pixels.parquet")
    if len(fires) > 1400:
        fires = fires.sample(1400, random_state=0)
    write("fires.json", [
        [round(float(r.longitude), 2), round(float(r.latitude), 2), round(float(r.frp), 0)]
        for r in fires.itertuples()
    ])

    traj = pd.read_csv("outputs/delhi_backtrajectory.csv")
    write("trajectory.json", [[round(float(r.lon), 2), round(float(r.lat), 2)] for r in traj.itertuples()])

    # ---- india outline geojson -----------------------------------------
    write("india.geojson", {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature", "properties": {"name": "India"},
            "geometry": {"type": "Polygon", "coordinates": [INDIA_POLY]},
        }],
    })
    print("done -> web/public/data/")


if __name__ == "__main__":
    main()

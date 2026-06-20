#!/usr/bin/env python
"""Phase 4 -- preprocessing: regrid -> QA filter -> temporal aggregate -> collocate.

Reads the raw exports (GeoTIFF/NetCDF) from data/raw, produces a co-registered
daily Dataset in data/interim, and the station-collocated training rows.

    python pipelines/02_preprocess.py --config config/config.yaml
"""

from __future__ import annotations

import argparse

from isro_aqi.config import load_config
from isro_aqi.preprocessing import qa_filter
from isro_aqi.utils.geo import Grid
from isro_aqi.utils.logging import get_logger

log = get_logger("preprocess")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/config.yaml")
    args = ap.parse_args()
    cfg = load_config(args.config)

    grid = Grid(tuple(cfg.aoi.bbox), cfg.grid.aqi_resolution_deg)
    log.info(f"analysis grid {grid.shape} @ {cfg.grid.aqi_resolution_deg} deg")

    # 1. open + regrid each raw raster onto `grid`  (preprocessing.regrid)
    # 2. merge into one (time, lat, lon) Dataset
    # 3. qa_filter.apply(ds)
    # 4. temporal.daily_mean(ds) -> data/interim/daily.zarr
    # 5. collocate.sample_at_stations(ds, stations) + join_targets(cpcb_daily)
    log.info("Wire: regrid -> merge -> qa_filter.apply -> temporal -> collocate.")
    log.info("Outputs: data/interim/daily.zarr ; data/processed/collocated.parquet")
    _ = qa_filter  # keep import meaningful until wired


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""Phases 12-13 -- HCHO-ozone relationship + wind transport analysis.

    python pipelines/07_transport.py --config config/config.yaml \
        [--receptor delhi] [--date 2021-11-05]
"""

from __future__ import annotations

import argparse

from isro_aqi.config import load_config
from isro_aqi.hcho import ozone_relationship, transport
from isro_aqi.utils.logging import get_logger

log = get_logger("transport")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/config.yaml")
    ap.add_argument("--receptor", default="delhi")
    ap.add_argument("--date")
    args = ap.parse_args()
    cfg = load_config(args.config)

    # --- HCHO-ozone (Phase 12) ---
    # df = read_parquet("data/processed/training.parquet")  # has hcho, no2, o3_obs, season
    # by_season = ozone_relationship.correlation_by_season(df, hcho="hcho", o3="o3_obs")
    # df = ozone_relationship.fnr_regime(df, **cfg.hcho.fnr)   # VOC- vs NOx-limited
    #
    # --- transport (Phase 13) ---
    # receptor = cfg.regions["receptors"][args.receptor]
    # winds = read_zarr("data/interim/daily.zarr")[["u_wind","v_wind"]]
    # path = transport.back_trajectory(winds, receptor[0], receptor[1], args.date, hours=48)
    # fires = ...  # VIIRS pixels for the window
    # n = transport.fires_along_path(path, fires)  # did upwind fires feed this receptor?
    log.info(f"receptor={args.receptor} date={args.date}")
    log.info("Wire: correlation_by_season + fnr_regime ; back_trajectory + fires_along_path")
    _ = (ozone_relationship, transport)


if __name__ == "__main__":
    main()

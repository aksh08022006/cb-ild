#!/usr/bin/env python
"""Phase 2 -- data ingestion.

Pulls every dataset for the configured AOI + time window. GEE sources export to
Drive/GCS asynchronously (poll the returned tasks); INSAT (MOSDAC) and CPCB are
local. Run month-by-month for India-scale stability.

    python pipelines/01_ingest.py --config config/config.yaml [--start 2021-01-01 --end 2021-01-31]
"""

from __future__ import annotations

import argparse

from isro_aqi.config import load_config
from isro_aqi.ingestion import era5, modis_fire, sentinel5p, srtm, worldcover
from isro_aqi.ingestion.gee_auth import init_ee
from isro_aqi.utils.logging import get_logger

log = get_logger("ingest")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/config.yaml")
    ap.add_argument("--start")
    ap.add_argument("--end")
    ap.add_argument("--static", action="store_true", help="also export static layers (DEM, land cover)")
    args = ap.parse_args()

    cfg = load_config(args.config)
    start, end = args.start or cfg.time.start, args.end or cfg.time.end
    init_ee(cfg)

    tasks = []
    log.info(f"ingesting {start} .. {end}")
    tasks += sentinel5p.export_period(cfg, start, end)   # NO2, SO2, CO, O3, HCHO
    tasks += era5.export_period(cfg, start, end)          # meteorology
    tasks += modis_fire.export_period(cfg, start, end)    # FRP, burned area, EVI

    if args.static:
        tasks += worldcover.export(cfg)
        tasks += srtm.export(cfg)

    log.info(f"{len(tasks)} GEE export tasks started; monitor with task.status()")
    log.info("INSAT-3D AOD: run MOSDAC download (ingestion/insat_aod.py).")
    log.info("CPCB: place station CSVs in data/external and parse with ingestion/cpcb.py.")
    log.info("ERA5 BLH: fetch via CDS (era5.fetch_blh_cds) per year.")


if __name__ == "__main__":
    main()

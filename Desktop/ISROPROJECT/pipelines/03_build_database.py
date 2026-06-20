#!/usr/bin/env python
"""Phase 3 -- assemble the unified India-wide database.

Builds the supervised training table (collocated predictors + CPCB targets) and
the large inference grid (~50-100 M rows) as year/month-partitioned parquet.

    python pipelines/03_build_database.py --config config/config.yaml
"""

from __future__ import annotations

import argparse

from isro_aqi.config import load_config
from isro_aqi.database import build_db
from isro_aqi.features import add_engineered_features
from isro_aqi.utils.logging import get_logger

log = get_logger("build_db")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/config.yaml")
    args = ap.parse_args()
    cfg = load_config(args.config)

    # collocated = read_parquet("data/processed/collocated.parquet")
    # collocated = add_engineered_features(collocated, lag_cols=["aod","no2","hcho","temperature"])
    # build_db.build_training_table(collocated, "data/processed/training.parquet")
    #
    # daily = read_zarr("data/interim/daily.zarr")
    # daily = <add engineered grid features>
    # build_db.build_inference_grid(daily, "data/processed/inference")
    log.info("Wire: load collocated -> add_engineered_features -> build_training_table")
    log.info("      load daily.zarr -> engineer -> build_inference_grid")
    _ = (build_db, add_engineered_features)


if __name__ == "__main__":
    main()

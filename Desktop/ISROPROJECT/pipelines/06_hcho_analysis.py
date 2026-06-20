#!/usr/bin/env python
"""Phases 7-11 -- HCHO hotspots + biomass-burning + source attribution.

    python pipelines/06_hcho_analysis.py --config config/config.yaml \
        [--method phv|gi|dbscan|percentile] [--season post_monsoon]
"""

from __future__ import annotations

import argparse

from isro_aqi.config import load_config
from isro_aqi.hcho import dbscan_hotspots, getis_ord, percentile, phv, source_attribution
from isro_aqi.utils.logging import get_logger
from isro_aqi.viz.maps import hcho_map

log = get_logger("hcho")


def detect(method, hcho_da, cfg):
    if method == "phv":
        return phv.detect_hotspots(hcho_da, cfg.hcho.phv_min, cfg.hcho.hva_threshold)
    if method == "gi":
        return getis_ord.gi_star(hcho_da, **cfg.hcho.getis_ord)
    if method == "dbscan":
        return dbscan_hotspots.cluster_hotspots(hcho_da, percentile=cfg.hcho.percentile, **cfg.hcho.dbscan)
    return percentile.percentile_threshold(hcho_da, cfg.hcho.percentile)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/config.yaml")
    ap.add_argument("--method", default="phv", choices=["phv", "gi", "dbscan", "percentile"])
    ap.add_argument("--season", default=None)
    args = ap.parse_args()
    cfg = load_config(args.config)

    # hcho_da = read HCHO composite (data/interim) at cfg.grid.hcho_resolution_deg,
    #           qa-screened (qa_value > cfg.hcho.qa_threshold)
    # result = detect(args.method, hcho_da, cfg)
    # hotspots = clusters/cells -> attribute with the fire/EVI collocation:
    # hotspots = source_attribution.attribute(hotspots, cfg.regions, season=args.season)
    # hcho_map(hcho_da, hotspots, out_path=f"{cfg.paths.outputs_maps}/hcho_{args.method}.png")
    log.info(f"method={args.method} season={args.season}")
    log.info("Wire: load qa-screened HCHO -> detect -> source_attribution.attribute -> hcho_map")
    _ = (detect, source_attribution, hcho_map)


if __name__ == "__main__":
    main()

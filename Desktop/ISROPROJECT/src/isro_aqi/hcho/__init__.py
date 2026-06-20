"""HCHO hotspot detection, attribution and relationships (Phases 9-13).

Detection (Phase 9):
    phv             PHV = centre / mean(8 neighbours)   [Dong et al. 2026]
    percentile      P95 threshold
    getis_ord       Getis-Ord Gi* statistically-significant clusters
    dbscan_hotspots density-based clustering of high-HCHO pixels

Interpretation:
    source_attribution   classify hotspots: urban / industrial / agri / forest
    ozone_relationship   HCHO-O3 correlation, lag, HCHO/NO2 (FNR) regime
    transport            wind-driven transport / trajectory analysis
"""

"""DBSCAN hotspot clustering tests."""

import numpy as np
import xarray as xr

from isro_aqi.hcho.dbscan_hotspots import cluster_hotspots


def _grid(arr, res=0.01):
    n, m = arr.shape
    lat = (np.arange(n)[::-1] * res).astype(float)
    lon = (np.arange(m) * res).astype(float)
    return xr.DataArray(arr.astype("float64"), coords={"lat": lat, "lon": lon}, dims=("lat", "lon"))


def test_cluster_groups_contiguous_block_and_drops_noise():
    a = np.zeros((20, 20))
    a[2:5, 2:5] = 100.0      # 9-cell high block -> one cluster (>= min_samples)
    a[15, 15] = 100.0        # isolated high -> DBSCAN noise, dropped
    da = _grid(a)
    clusters = cluster_hotspots(da, threshold=50.0, eps_deg=0.05, min_samples=5)
    assert len(clusters) == 1
    row = clusters.iloc[0]
    assert row["n_cells"] == 9
    assert row["hcho_max"] == 100.0


def test_empty_when_nothing_exceeds_threshold():
    da = _grid(np.zeros((10, 10)))
    clusters = cluster_hotspots(da, threshold=50.0, min_samples=5)
    assert clusters.empty

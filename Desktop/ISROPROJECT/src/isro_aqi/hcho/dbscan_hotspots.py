"""DBSCAN cluster detection (Method 3).

PHV/Gi* flag *cells*; DBSCAN groups high-HCHO cells into spatially-contiguous
*clusters* and discards isolated noise pixels. Each returned cluster gets a
centroid, size, and mean HCHO -- the unit of analysis for source attribution.

eps is in degrees (haversine would be more correct at India's latitudes, but the
small bandwidth makes the planar approximation fine; switch metric='haversine'
with radians for rigour).
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import xarray as xr
from sklearn.cluster import DBSCAN


def cluster_hotspots(
    hcho: xr.DataArray,
    threshold: float | None = None,
    percentile: float = 95.0,
    eps_deg: float = 0.05,
    min_samples: int = 5,
) -> pd.DataFrame:
    """Cluster cells exceeding a threshold; return one row per cluster.

    Returns columns: cluster, n_cells, lon, lat (centroid), hcho_mean, hcho_max.
    Cluster -1 (DBSCAN noise) is dropped.
    """
    da = hcho
    thr = threshold if threshold is not None else float(np.nanpercentile(da.values, percentile))

    lon2d, lat2d = np.meshgrid(da["lon"].values, da["lat"].values)
    vals = da.values
    sel = (vals >= thr) & np.isfinite(vals)
    if sel.sum() == 0:
        return pd.DataFrame(columns=["cluster", "n_cells", "lon", "lat", "hcho_mean", "hcho_max"])

    pts = np.column_stack([lon2d[sel], lat2d[sel]])
    weights = vals[sel]
    labels = DBSCAN(eps=eps_deg, min_samples=min_samples).fit_predict(pts)

    df = pd.DataFrame({"lon": pts[:, 0], "lat": pts[:, 1], "hcho": weights, "cluster": labels})
    df = df[df["cluster"] >= 0]
    out = (
        df.groupby("cluster")
        .agg(
            n_cells=("hcho", "size"),
            lon=("lon", "mean"),
            lat=("lat", "mean"),
            hcho_mean=("hcho", "mean"),
            hcho_max=("hcho", "max"),
        )
        .reset_index()
        .sort_values("hcho_mean", ascending=False)
    )
    return out

"""Percentile-threshold hotspot detection (Method 1).

The simplest, most reproducible baseline: flag cells above the P95 (configurable)
of the valid HCHO distribution. Useful as a sanity check against PHV / Gi* and for
quick seasonal hotspot masks.
"""

from __future__ import annotations

import numpy as np
import xarray as xr


def percentile_threshold(hcho: xr.DataArray, q: float = 95.0) -> xr.Dataset:
    """Mask cells with HCHO above the q-th percentile of the valid distribution."""
    thr = float(np.nanpercentile(hcho.values, q))
    mask = hcho > thr
    return xr.Dataset(
        {"hotspot": mask, "hcho": hcho},
        coords=hcho.coords,
        attrs={"threshold": thr, "percentile": q},
    )

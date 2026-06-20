"""HCHO-ozone relationship analysis (Phase 12).

Three publishable analyses:

1. Correlation       Pearson/Spearman HCHO vs surface O3, by region & season.
                     Dong et al. 2026: R(HCHO,O3) ~ 0.43 annual, ~0.89 in the
                     ozone season (Apr-Sep) -- so always stratify by season.

2. Lag / cross-corr  HCHO leads O3 (precursor). Cross-correlation finds the lag
                     (days) of peak correlation -> evidence of causal precursor
                     behaviour rather than coincidence.

3. FNR regime        FNR = HCHO/NO2 column ratio classifies O3 production
                     sensitivity:  <2.67 VOC-limited | 2.67-3.47 transition |
                     >3.47 NOx-limited (Dong 2026). The canonical India rule
                     (Kuttippurath 2022 / Jin 2015): <1 VOC-sensitive, >2
                     NOx-limited, 1-2 mixed. Configurable thresholds.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr


def correlation(df: pd.DataFrame, hcho="hcho", o3="o3_obs", method="pearson") -> dict:
    """Correlation of HCHO with surface O3 over the rows provided (drops NaN)."""
    sub = df[[hcho, o3]].dropna()
    if len(sub) < 3:
        return {"r": np.nan, "p": np.nan, "n": len(sub)}
    fn = pearsonr if method == "pearson" else spearmanr
    r, p = fn(sub[hcho], sub[o3])
    return {"r": float(r), "p": float(p), "n": len(sub), "method": method}


def correlation_by_season(df: pd.DataFrame, season_col="season", **kw) -> pd.DataFrame:
    return (
        df.groupby(season_col)
        .apply(lambda g: pd.Series(correlation(g, **kw)))
        .reset_index()
    )


def cross_correlation(
    hcho_series: pd.Series, o3_series: pd.Series, max_lag: int = 7
) -> pd.DataFrame:
    """Cross-correlation of HCHO (leading) vs O3 for lags 0..max_lag days.

    Positive lag k = HCHO at day t correlated with O3 at day t+k. The lag with
    max correlation is the apparent precursor lead time.
    """
    a = (hcho_series - hcho_series.mean()).to_numpy()
    b = (o3_series - o3_series.mean()).to_numpy()
    rows = []
    for k in range(0, max_lag + 1):
        if k == 0:
            r = np.corrcoef(a, b)[0, 1]
        else:
            r = np.corrcoef(a[:-k], b[k:])[0, 1]
        rows.append({"lag_days": k, "r": float(r)})
    return pd.DataFrame(rows)


def fnr_regime(
    df: pd.DataFrame,
    hcho="hcho",
    no2="no2",
    voc_limited_max: float = 2.67,
    nox_limited_min: float = 3.47,
) -> pd.DataFrame:
    """Add `fnr` and `o3_regime` (VOC-limited / transition / NOx-limited)."""
    out = df.copy()
    out["fnr"] = out[hcho] / (out[no2] + 1e-30)
    out["o3_regime"] = pd.cut(
        out["fnr"],
        bins=[-np.inf, voc_limited_max, nox_limited_min, np.inf],
        labels=["VOC-limited", "transition", "NOx-limited"],
    )
    return out

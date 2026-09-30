#!/usr/bin/env python3
"""
A2 helper: man base → barefoot + boxers only (remove dark tank).
Operates on Standard Fit 480×900 RGBA. In-place overwrite.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "assets/images/bases/man.png",
    ROOT / "assets/images/bases/turn/man_0.png",
    ROOT / "assets/images/bases/turn/man_45.png",
    ROOT / "assets/images/bases/turn/man_90.png",
    ROOT / "assets/images/bases/turn/man_135.png",
    ROOT / "assets/images/bases/turn/man_180.png",
    ROOT / "assets/images/bases/turn/man_225.png",
    ROOT / "assets/images/bases/turn/man_270.png",
    ROOT / "assets/images/bases/turn/man_315.png",
]


def is_dark_fabric(rgb: np.ndarray) -> np.ndarray:
    """Charcoal tank: dark, low chroma."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    chroma = mx - mn
    return (mx < 95) & (chroma < 35) & (r.astype(np.int16) - b.astype(np.int16) < 25)


def skin_sample(arr: np.ndarray) -> np.ndarray:
    """Sample warm skin from upper chest / shoulder sides (outside tank)."""
    a = arr
    # neck / upper chest sides
    rois = [
        a[150:200, 200:280],
        a[200:260, 110:150],
        a[200:260, 330:370],
        a[520:620, 180:300],  # thighs — skin backup
    ]
    samples = []
    for roi in rois:
        rgb = roi[..., :3].astype(np.float32)
        alpha = roi[..., 3]
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        warm = (r > 120) & (g > 70) & (b > 50) & (r > b + 15) & (alpha > 200)
        if warm.any():
            samples.append(rgb[warm])
    if not samples:
        return np.array([175.0, 125.0, 95.0], dtype=np.float32)
    all_s = np.concatenate(samples, axis=0)
    return np.median(all_s, axis=0)


def clean_one(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    if im.size != (480, 900):
        print(f"skip {path.name}: size {im.size}")
        return
    arr = np.array(im)
    rgb = arr[..., :3]
    alpha = arr[..., 3]

    # Tank ROI — neck to waist, between arms
    y0, y1, x0, x1 = 145, 360, 130, 350
    roi = rgb[y0:y1, x0:x1]
    mask = is_dark_fabric(roi) & (alpha[y0:y1, x0:x1] > 180)

    # Don't erase near arm edges too aggressively — erode slightly via neighbor count
    from scipy import ndimage  # optional

    try:
        mask = ndimage.binary_opening(mask, iterations=1)
        mask = ndimage.binary_dilation(mask, iterations=1)
    except Exception:
        pass

    if mask.sum() < 200:
        print(f"{path.name}: little tank detected ({mask.sum()} px) — leave as-is")
        return

    skin = skin_sample(arr)
    # Vertical lighting gradient (lighter chest → slightly darker abs)
    h = y1 - y0
    grad = np.linspace(1.06, 0.92, h, dtype=np.float32)[:, None, None]
    painted = np.clip(skin[None, None, :] * grad, 0, 255)

    # Soft edge: distance-ish via blur of mask
    m = mask.astype(np.float32)
    try:
        m = ndimage.gaussian_filter(m, sigma=1.2)
    except Exception:
        pass
    m3 = m[..., None]
    out = roi.astype(np.float32) * (1 - m3) + painted * m3
    arr[y0:y1, x0:x1, :3] = np.clip(out, 0, 255).astype(np.uint8)

    Image.fromarray(arr, "RGBA").save(path, optimize=True)
    print(f"{path.name}: cleaned tank px~{int(mask.sum())}")


def main() -> int:
    try:
        import scipy  # noqa: F401
    except ImportError:
        print("Installing scipy for morphology…")
        import subprocess

        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "scipy"])

    for p in TARGETS:
        if p.exists():
            clean_one(p)
        else:
            print(f"missing {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

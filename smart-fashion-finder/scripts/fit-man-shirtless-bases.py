#!/usr/bin/env python3
"""
Fit AI-generated shirtless man bases onto Standard Fit 480×900 RGBA
(transparent black bg), matching the legacy tank framing (head≈36, feet≈863).

Sources: /opt/cursor/artifacts/assets/man_base_shirtless_{front,45,90,135,180}.jpg
Outputs: assets/images/bases/man.png + turn/man_{0,45,90,135,180,225,270,315}.png
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BASES = ROOT / "assets/images/bases"
TURN = BASES / "turn"
SRC = Path("/opt/cursor/artifacts/assets")

CANVAS_W, CANVAS_H = 480, 900
# Match clean tank subject framing from git 66b18ac5
TARGET_TOP = 36
TARGET_BOTTOM = 863  # inclusive
TARGET_H = TARGET_BOTTOM - TARGET_TOP + 1  # 828


def subject_mask(rgb: np.ndarray) -> np.ndarray:
    """Soft subject mask from near-black studio background."""
    lum = rgb.max(axis=2).astype(np.float32)
    # hard core + soft edge
    hard = lum > 22
    soft = np.clip((lum - 8.0) / 28.0, 0.0, 1.0)
    # keep hard interior fully opaque
    alpha = np.where(hard, 1.0, soft)
    return alpha


def bbox_from_alpha(alpha: np.ndarray, thr: float = 0.15) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha >= thr)
    if len(xs) == 0:
        raise RuntimeError("empty subject")
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def fit_to_canvas(src_path: Path, *, flip: bool = False) -> Image.Image:
    im = Image.open(src_path).convert("RGB")
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    rgb = np.array(im)
    alpha = subject_mask(rgb)
    x0, y0, x1, y1 = bbox_from_alpha(alpha)
    crop_rgb = rgb[y0 : y1 + 1, x0 : x1 + 1]
    crop_a = alpha[y0 : y1 + 1, x0 : x1 + 1]
    ch, cw = crop_a.shape
    scale = TARGET_H / ch
    new_w = max(1, int(round(cw * scale)))
    new_h = TARGET_H
    rgba = np.dstack([crop_rgb, (crop_a * 255).astype(np.uint8)])
    pil = Image.fromarray(rgba, "RGBA").resize((new_w, new_h), Image.Resampling.LANCZOS)
    # slight edge soften
    a = pil.split()[3].filter(ImageFilter.GaussianBlur(radius=0.6))
    r, g, b, _ = pil.split()
    pil = Image.merge("RGBA", (r, g, b, a))

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    x = (CANVAS_W - new_w) // 2
    y = TARGET_TOP
    canvas.paste(pil, (x, y), pil)
    return canvas


def main() -> None:
    mapping = {
        "front": (SRC / "man_base_shirtless_front.jpg", False),
        "45": (SRC / "man_base_shirtless_45.jpg", False),
        # generated profile faced opposite of legacy man_90 — flip to match
        "90": (SRC / "man_base_shirtless_90.jpg", True),
        "135": (SRC / "man_base_shirtless_135.jpg", False),
        "180": (SRC / "man_base_shirtless_180.jpg", False),
    }
    for key, (path, flip) in mapping.items():
        if not path.exists():
            raise SystemExit(f"missing source: {path}")
        print(f"fit {key} from {path.name} flip={flip}")
        out = fit_to_canvas(path, flip=flip)
        if key == "front":
            out.save(BASES / "man.png", optimize=True)
            out.save(TURN / "man_0.png", optimize=True)
            print("  -> man.png, turn/man_0.png", out.size)
        else:
            dest = TURN / f"man_{key}.png"
            out.save(dest, optimize=True)
            print(f"  -> {dest.relative_to(ROOT)}", out.size)

    # Mirrored companions for on-disk completeness (not in TURN_YAWS)
    pairs = [("45", "315"), ("90", "270"), ("135", "225")]
    for src_yaw, dst_yaw in pairs:
        src = Image.open(TURN / f"man_{src_yaw}.png")
        flipped = src.transpose(Image.FLIP_LEFT_RIGHT)
        flipped.save(TURN / f"man_{dst_yaw}.png", optimize=True)
        print(f"mirror man_{src_yaw} -> man_{dst_yaw}")

    # Quick framing report
    for name in ["man.png", "turn/man_0.png", "turn/man_45.png", "turn/man_90.png", "turn/man_135.png", "turn/man_180.png"]:
        im = Image.open(BASES / name)
        a = np.array(im)
        ys, xs = np.where(a[:, :, 3] > 40)
        print(
            f"QA {name}: bbox=({xs.min()},{ys.min()})-({xs.max()},{ys.max()}) "
            f"h={ys.max()-ys.min()+1} alpha_mean={a[:,:,3].mean():.1f}"
        )


if __name__ == "__main__":
    main()

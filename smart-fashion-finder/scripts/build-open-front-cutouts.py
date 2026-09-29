#!/usr/bin/env python3
"""Align outer cutouts to Standard Fit shoulders and punch open-front placket."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

STD = (480, 900)
TARGET_TOP = 150
CUT = Path(__file__).resolve().parents[1] / 'assets/images/layers/cutouts'
SOURCES = {
    'bomber.png': 'bomber-open.png',
    'denim-jkt.png': 'denim-jkt-open.png',
    'leather.png': 'leather-open.png',
    'hoodie.png': 'hoodie-open.png',
}

def make_open(src: Path, dst: Path) -> None:
    im = Image.open(src).convert('RGBA')
    if im.size != STD:
        im = im.resize(STD, Image.Resampling.LANCZOS)
    a = np.array(im)
    ys = np.where(a[:, :, 3] > 25)[0]
    top = int(ys.min()) if len(ys) else 0
    dy = TARGET_TOP - top
    canvas = Image.new('RGBA', STD, (0, 0, 0, 0))
    canvas.paste(im, (0, dy), im)
    a = np.array(canvas)
    mask = Image.new('L', STD, 0)
    d = ImageDraw.Draw(mask)
    d.polygon([(240, 200), (305, 260), (300, 400), (240, 450), (180, 400), (175, 260)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(10))
    m = np.array(mask).astype(np.float32) / 255.0
    a[:, :, 3] = (a[:, :, 3] * (1.0 - m * 0.92)).astype(np.uint8)
    Image.fromarray(a).save(dst)
    print(f'{dst.name}: dy={dy} chest_open={(a[270:370, 215:265, 3] < 50).mean():.2f}')

def main() -> None:
    for src_name, dst_name in SOURCES.items():
        make_open(CUT / src_name, CUT / dst_name)

if __name__ == '__main__':
    main()

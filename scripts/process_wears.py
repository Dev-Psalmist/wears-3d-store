#!/usr/bin/env python3
"""Build the wear assets: cut-out PNG + depth map for each product photo.

For every source photo in assets/source/ this writes two files to public/wears/:

  <slug>.png         RGBA cut-out, background removed, trimmed, max 1100px
  <slug>-depth.png   grayscale height map used to inflate the cut-out into a mesh

The depth map is a smoothed euclidean distance transform of the alpha mask, so the
middle of each garment bulges toward the viewer and the edges taper to zero. Combined
with the photo as a texture that turns a flat product shot into a puffed 3D slab that can
be spun a full 360 degrees.

Usage:  python3 scripts/process_wears.py
"""
from __future__ import annotations

import pathlib
import sys
from io import BytesIO

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import distance_transform_edt, gaussian_filter

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "source"
OUT = ROOT / "public" / "wears"

MAX_SIDE = 1100
DEPTH_SIDE = 512
# How far the depth map is pushed into the material. Tuned against the shelf height.
DEPTH_GAMMA = 0.62


def cutout(path: pathlib.Path) -> Image.Image:
    from rembg import new_session, remove

    session = new_session("u2net")
    with path.open("rb") as handle:
        raw = remove(handle.read(), session=session, post_process_mask=True)
    return Image.open(BytesIO(raw)).convert("RGBA")


def trim(image: Image.Image, pad: int = 12) -> Image.Image:
    bbox = image.split()[-1].getbbox()
    if not bbox:
        raise SystemExit("empty alpha mask")
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    return image.crop((left, top, right, bottom))


def depth_map(image: Image.Image) -> Image.Image:
    alpha = np.asarray(image.split()[-1], dtype=np.float32) / 255.0
    mask = alpha > 0.5
    if not mask.any():
        raise SystemExit("empty mask")

    # Euclidean distance from the outside of the silhouette -> a rounded pillow.
    dist = distance_transform_edt(mask)
    dist = gaussian_filter(dist, sigma=max(2.0, dist.max() * 0.06))
    dist /= dist.max()
    dist = np.power(np.clip(dist, 0.0, 1.0), DEPTH_GAMMA)

    # Keep the silhouette edges hard so the mesh does not fade into the shelf.
    dist *= np.clip(alpha * 1.6, 0.0, 1.0)

    depth = Image.fromarray((dist * 255).astype(np.uint8), mode="L")
    depth = depth.resize(
        (
            max(1, round(depth.width * DEPTH_SIDE / max(depth.size))),
            max(1, round(depth.height * DEPTH_SIDE / max(depth.size))),
        ),
        Image.LANCZOS,
    )
    return depth.filter(ImageFilter.GaussianBlur(1.1))


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(p for p in SRC.iterdir() if p.suffix.lower() != ".mp4")
    if not sources:
        print(f"no source images in {SRC}", file=sys.stderr)
        return 1

    for path in sources:
        slug = path.stem
        image = cutout(path)
        image = trim(image)

        scale = MAX_SIDE / max(image.size)
        if scale < 1:
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)), Image.LANCZOS
            )

        image.save(OUT / f"{slug}.webp", quality=88, method=6)
        depth_map(image).save(OUT / f"{slug}-depth.webp", quality=90, method=6)

        alpha = np.asarray(image.split()[-1], dtype=np.float32) / 255.0
        print(
            f"{slug:12s} {image.width}x{image.height}  "
            f"coverage={alpha.mean():.2f}  "
            f"files={(OUT / f'{slug}.webp').stat().st_size // 1024}KB"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Prep OG Stores garments for 3D / turntable work.

Two strategies:
  object  - flat-lay or ghost-mannequin shot: isolate the item, trim, keep edges crisp.
  garment - shot on a model: isolate the person, then keep only the garment pixels
            (per-image luminance band + skin rejection), so the model is removed.

Outputs, per slug, into ./out:
  <slug>.png    transparent, trimmed, max 1400px on the long edge (source for AI tools)
  <slug>.webp   same image, compressed (for the site)
  <slug>-mask.png  the alpha mask alone (debug / re-use in Photoshop)
plus manifest.json and contact-sheet.jpg.
"""

from __future__ import annotations

import json
import pathlib
from io import BytesIO
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from rembg import new_session, remove
from scipy import ndimage

SRC = pathlib.Path("src")
OUT = pathlib.Path("out")
OUT.mkdir(exist_ok=True)

MAX_EDGE = 1400

# slug -> strategy + optional tuning for the on-model shots
JOBS = {
    "rift-06": {"strategy": "object"},
    "verge-10": {"strategy": "object"},
    "halo-02": {"strategy": "object"},
    "strata-04": {"strategy": "object"},
    "pulse-08": {"strategy": "object"},
    "velum-01": {"strategy": "object"},
    "nimbus-07": {"strategy": "object"},
    "arc-03": {"strategy": "garment", "band": (0.26, 0.66), "lum": (0.66, 1.01), "reject_skin": True},
    "lattice-05": {"strategy": "garment", "band": (0.04, 0.60), "lum": (0.74, 1.01), "reject_skin": False},
    "monolith-09": {"strategy": "garment", "band": (0.04, 0.88), "lum": (0.0, 0.34), "reject_skin": False},
}


def luminance(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]


def skin_mask(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[:, :, 0] * 255, rgb[:, :, 1] * 255, rgb[:, :, 2] * 255
    cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
    y = 0.299 * r + 0.587 * g + 0.114 * b
    return (cb >= 77) & (cb <= 130) & (cr >= 133) & (cr <= 178) & (y > 70)


def clean(mask: np.ndarray, keep_largest: bool = True, close: int = 3) -> np.ndarray:
    """Morphological tidy-up: close pinholes, drop specks, keep the main mass."""
    m = ndimage.binary_closing(mask, structure=np.ones((close, close)))
    if keep_largest:
        lab, n = ndimage.label(m)
        if n > 1:
            sizes = ndimage.sum(m, lab, range(1, n + 1))
            m = lab == (int(np.argmax(sizes)) + 1)
    m = ndimage.binary_fill_holes(m)
    return m


def feather(mask: np.ndarray, sigma: float = 1.1) -> np.ndarray:
    a = ndimage.gaussian_filter(mask.astype(np.float32), sigma)
    a = np.clip((a - 0.35) / 0.4, 0.0, 1.0)  # sharpen the ramp back up
    return a


def trim(img: Image.Image, alpha: np.ndarray, pad: int = 12) -> Image.Image:
    ys, xs = np.where(alpha > 0.06)
    if len(xs) == 0:
        return img
    x0, x1 = max(0, xs.min() - pad), min(img.width, xs.max() + pad + 1)
    y0, y1 = max(0, ys.min() - pad), min(img.height, ys.max() + pad + 1)
    return img.crop((x0, y0, x1, y1))


def fit(img: Image.Image, max_edge: int = MAX_EDGE) -> Image.Image:
    scale = min(1.0, max_edge / max(img.size))
    if scale >= 1.0:
        return img
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)


def process(slug: str, job: dict, session) -> dict:
    src = next(p for p in SRC.glob(f"{slug}.*"))
    raw = src.read_bytes()
    cut = Image.open(BytesIO(remove_io(raw, session))).convert("RGBA")
    rgb = np.asarray(cut)[:, :, :3].astype(np.float32) / 255.0
    person = np.asarray(cut)[:, :, 3].astype(np.float32) / 255.0 > 0.5

    note = ""
    if job["strategy"] == "object":
        mask = clean(person, close=5)
        note = "flat-lay / ghost-mannequin: background removed, item untouched"
    else:
        lum = luminance(rgb)
        skin = skin_mask(rgb)
        ys, xs = np.where(person)
        top, bottom = ys.min(), ys.max()
        band = np.zeros_like(person)
        y0 = int(top + (bottom - top) * job["band"][0])
        y1 = int(top + (bottom - top) * job["band"][1])
        band[y0:y1, :] = True

        lo, hi = job["lum"]
        mask = person & band & (lum >= lo) & (lum <= hi)
        if job["reject_skin"]:
            mask &= ~ndimage.binary_dilation(skin, iterations=2)
        mask = clean(mask, close=5)
        mask = ndimage.binary_dilation(mask, iterations=3) & ndimage.binary_dilation(person, iterations=1)
        note = "on-model shot: model removed by luminance band + skin rejection (verify edges)"

    alpha = feather(mask.astype(np.float32))
    out = cut.copy()
    out.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)))
    out = fit(trim(out, alpha))

    out.save(OUT / f"{slug}.png")
    out.save(OUT / f"{slug}.webp", quality=90, method=6)
    Image.fromarray(((np.asarray(out)[:, :, 3])).astype(np.uint8)).save(OUT / f"{slug}-mask.png")

    a = np.asarray(out)[:, :, 3].astype(np.float32) / 255.0
    rgb_out = np.asarray(out)[:, :, :3].astype(np.float32) / 255.0
    inside = a > 0.5
    sk = skin_mask(rgb_out) & inside
    ys, xs = np.where(inside)
    box_cov = inside.sum() / max(1, (xs.max() - xs.min() + 1) * (ys.max() - ys.min() + 1)) if inside.any() else 0

    return {
        "slug": slug,
        "strategy": job["strategy"],
        "source": src.name,
        "size": list(out.size),
        "aspect": round(out.width / out.height, 3),
        "fill_of_bbox": round(float(box_cov), 3),
        "skin_pct": round(float(100 * sk.sum() / max(1, inside.sum())), 2),
        "note": note,
    }


def remove_io(raw: bytes, session) -> bytes:
    return remove(raw, session=session, post_process_mask=True)


def contact_sheet(rows: list[dict]) -> None:
    cell, pad, label_h = 300, 18, 26
    cols = 5
    rows_n = (len(rows) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (cell + pad) + pad, rows_n * (cell + label_h + pad) + pad), (10, 10, 12))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    for i, row in enumerate(rows):
        im = Image.open(OUT / f"{row['slug']}.png").convert("RGBA")
        im.thumbnail((cell, cell), Image.LANCZOS)
        x = pad + (i % cols) * (cell + pad)
        y = pad + (i // cols) * (cell + label_h + pad)
        tile = Image.new("RGBA", (cell, cell), (24, 24, 27, 255))
        tile.alpha_composite(im, ((cell - im.width) // 2, (cell - im.height) // 2))
        sheet.paste(tile.convert("RGB"), (x, y))
        draw.text((x, y + cell + 4), f"{row['slug']}  {row['strategy'][:3]}", fill=(210, 205, 195), font=font)

    sheet.save(OUT / "contact-sheet.jpg", quality=92)
    print("contact sheet ->", OUT / "contact-sheet.jpg")


def main() -> None:
    session = new_session("u2net")
    rows = []
    for slug, job in JOBS.items():
        row = process(slug, job, session)
        rows.append(row)
        print(
            f"{row['slug']:12s} {row['strategy']:8s} {str(row['size']):12s} aspect={row['aspect']:5.2f} "
            f"fill={row['fill_of_bbox']:5.2f} skin={row['skin_pct']:5.2f}%"
        )
    (OUT / "manifest.json").write_text(json.dumps(rows, indent=2) + "\n")
    contact_sheet(rows)


if __name__ == "__main__":
    sys.exit(main())

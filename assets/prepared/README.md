# Garment prep and turntable handoff

Everything in this folder is ready to feed an image-to-3D or image-to-video tool.
Each piece is isolated, trimmed, and named after its product slug.

## What is in `assets/prepared/`

| slug | source shot | size | aspect | extraction |
| --- | --- | --- | --- | --- |
| rift-06 | flat-lay hoodie | 870×1179 | 0.74 | background removed, item untouched |
| verge-10 | flat-lay tee | 1185×1400 | 0.85 | background removed, item untouched |
| halo-02 | ghost-mannequin bomber | 753×734 | 1.03 | background removed, item untouched |
| strata-04 | flat-lay cargos | 490×1200 | 0.41 | background removed, item untouched |
| pulse-08 | flat-lay cap | 1400×871 | 1.61 | background removed, item untouched |
| velum-01 | flat-lay joggers | 459×800 | 0.57 | background removed, item untouched |
| nimbus-07 | flat-lay puffer | 349×468 | 0.75 | background removed, item untouched |
| arc-03 | on-model tee | 1062×724 | 1.47 | model removed (luminance band + skin rejection) |
| lattice-05 | on-model knit | 550×444 | 1.24 | model removed (luminance band, colour matched to the chest at 0.88/0.81/0.73) |
| monolith-09 | on-model parka | 308×538 | 0.57 | model removed (dark-mass extraction) |

Per slug there are three files:

- `<slug>.png` — transparent, trimmed, max 1400 px on the long edge. Use this as the source image.
- `<slug>.webp` — compressed copy for the site.
- `<slug>-mask.png` — the alpha channel alone, if you want to refine edges in Photoshop or Affinity.

`manifest.json` carries the measured properties, `contact-sheet.jpg` is a one-page visual check,
and `scripts/prep-garments.py` regenerates the whole set (`python3 scripts/prep-garments.py`).

### The three on-model shots

`arc-03`, `lattice-05` and `monolith-09` arrived on a model. The model is removed, but the edges
are the weakest of the set because there is no second view to check against. Before a paid
image-to-3D run, glance at those three in the contact sheet. If an edge is soft, mask it by hand
and re-save as `<slug>.png`; everything downstream picks up the new file. The cleanest fix for
these three is a flat-lay or ghost-mannequin reshoot.

## Route A — true 3D mesh (Meshy / Tripo / Rodin → Blender or Spline)

1. Upload `<slug>.png` (PNG, not WebP, so alpha survives).
2. Settings that keep logos readable:
   - **Topology**: quad, 8–15k faces. Below 8k the lettering on ARC, HALO, MAAP and Carhartt turns to mush.
   - **Texture**: 2K, `albedo` only. Skip PBR generation, it invents fabric grain that fights the print.
   - **Symmetry**: off. A hoodie pocket and the HALO chest print are asymmetric.
   - **Pose**: neutral / T-pose for garments, not "auto pose".
3. In Blender: scale to 1.8 m tall for outerwear, 0.9 m for trousers, 0.35 m for the cap, apply a
   Subdivision (1) and a Cloth or Corrective Smooth of 0.2 to soften the puffed volume. Do not add
   a Solidify above 4 mm, it thickens hems into slabs.
4. Turntable: keyframe Z rotation 0° → 360° over 120 frames, linear interpolation, then export
   either a GLB for the live stage or a frame sequence (see the contract below).

Per-garment prompt additions (append to the tool's base prompt):

- **rift-06** — "brown heavyweight pullover hoodie, kangaroo pocket, ribbed cuffs, embroidered
  'carhartt' across the chest kept sharp and unwarped"
- **verge-10** — "plain black cotton tee, small white V on the left chest, tag detail at the collar"
- **halo-02** — "black nylon bomber, ribbed collar and hem, 'HALO' chest print, zipped utility
  pocket on the left sleeve, orange interior tag"
- **strata-04** — "brown and tan camouflage cargo trousers, flap thigh pockets, vertical zip on the
  right leg, 'STRATA' print kept legible"
- **pulse-08** — "light grey cycling cap, curved visor, 'MAAP' stacked three times in green on the
  side, 'Art & Progression' along the crown seam"
- **velum-01** — "black wide-leg sweatpants, drawstring waist, lace-up side seams with metal eyelets"
- **arc-03** — "off-white boxy tee, pale lime outlined 'LOS ANGELES' arched over a bold black 'ARC',
  'ATHLETICS' below, small lime triangle at the hem"
- **nimbus-07** — "bright orange quilted puffer, horizontal baffles, hood with toggle drawstrings"
- **lattice-05** — "off-white short-sleeve open-knit sweater, crew neck, ribbed cuffs and hem"
- **monolith-09** — "black knee-length hooded parka, buttoned placket, prominent hood"

## Route B — AI video turntable

Feed one isolated PNG per generation, one garment at a time. Never put two pieces in the frame:
that is what merges logos mid-spin.

Prompt template:

> A single [garment] floating against a pure black background, centred, no model, no hands.
> The camera orbits the garment exactly 360 degrees on a vertical axis, constant speed, one full
> revolution. Studio softbox lighting from above with a subtle orange rim light from behind.
> The garment keeps its exact shape, fabric texture and printed logos unchanged in every frame.
> Locked framing, no zoom, no cuts, no text, no watermark.

Then export the clip as an image sequence, 24–36 frames, and rename them to the contract below.

## Frame-sequence contract for the site

The detail page already has a turntable player (`src/components/Turntable.tsx`). Drop frames in and
it takes over from the three.js stage automatically; no code change needed.

```
public/turns/<slug>/frame-00.webp   frame-01.webp   ...   frame-NN.webp
public/turns/manifest.json
```

```json
{
  "rift-06": { "frames": 24, "step": 15 },
  "nimbus-07": { "frames": 36, "step": 10 }
}
```

Rules:

- 24 or 36 frames, evenly spaced, frame 00 = front. 360 / frames is the step.
- Same canvas size and crop in every frame, transparent or pure black background, max 900 px.
- One garment per sequence. `step` is optional and defaults to 360 / frames.
- Until a slug appears in `manifest.json`, that product keeps the live 3D stage, so the site is
  never half-broken.

## Why this cannot be finished locally

A single photo cannot yield a real 360: the back of a hoodie is not in the frame. The two routes
above need an external service (Meshy, Tripo, Rodin, or an image-to-video model). Everything on
this side of that boundary is done: cut-outs, naming, manifest, prompts, and the player that
consumes the result.

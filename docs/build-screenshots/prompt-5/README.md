# Prompt 5 — Image Normalization Batch (Staged Gate Evidence)

**Status:** Staged. Awaiting human sign-off before migration runs.

## Run summary

- **Date:** 2026-05-01
- **Pipeline duration:** 97.7s (full 100-SKU batch) + 1 SKU re-run after URL-parsing fix
- **AI calls:** 9 (remove.bg only — Lovable AI Gateway DROPPED per dry-run finding)
- **remove.bg credits used:** 9
- **Bucket distribution (final):**
  - A = 0 (no perfectly canonical sources — every thumbnail needs trim+pad)
  - B = 82 (PIL-only normalization — alpha present, bbox tight)
  - C = 9 (low-res, below 500px floor — Lucide category-icon fallback at render time, no normalized output uploaded)
  - D = 9 (opaque, AI-matted via remove.bg)
  - E = 0 (clean run after URL fix)

## Pipeline (corrected classifier order, locked from dry-run)

1. **Low-res check** — `min(w, h) < 500` → bucket C → Lucide fallback (no upload)
2. **Alpha presence** — RGBA / LA / paletted-with-transparency, with `transparent_ratio > 0.02`
3. **Bbox / fill ratio** — alpha present and tight bbox → bucket B (PIL trim + pad); otherwise A
4. **Opaque** — no usable alpha → bucket D → remove.bg AI matting

All B and D outputs normalized to **1000×1000 transparent WebP** at quality 85, fill_target 0.82, LANCZOS resampling, then uploaded to the parallel storage bucket `product-images-normalized/<stock_code>.webp`.

## Storage path (Option C — parallel, atomic swap pending)

- **Originals:** untouched at `product-images/<stock_code>/<stock_code>{_1,}.{png,jpg,webp}`
- **Normalized:** new bucket `product-images-normalized/<stock_code>.webp` (public read, service-role write)
- Migration to swap `products.thumbnail_url` is **not yet applied** — runs only after human sign-off on this gate.

## Gate evidence (Rule 12)

- `before-after-grid.png` — 10 representatives spanning all 10 nav-parents and both processing paths (2 D-bucket AI-matted, 8 B-bucket PIL-normalized). Source vs. 1000×1000 normalized WebP, side-by-side.
- `category-cutlery-pre-migration.png` — Live Cutlery category page with current (pre-migration) thumbnails, captured against the same viewport that will be re-screenshotted post-migration for live-state confirmation.
- `manual-review.csv` — Per-SKU row with bucket, source dimensions, alpha stats, action_required, and any errors. 100 rows + header.
- `audit.json` — Aggregate distribution and timing.
- `results.json` — Full per-SKU detail (source URL, bucket, meta, alpha stats, upload status, normalized bytes).

## Key per-bucket reads

- **B (82 SKUs):** Deterministic PIL pipeline: bbox-trim → LANCZOS resize so longest side hits 820px → center-pad on 1000² transparent canvas. Avg `partial_alpha_pct` ~1.2–1.5% (anti-aliased edges only — clean alpha, no fringe).
- **C (9 SKUs):** Routed to Lucide category-icon fallback at render time. These will retain a category-appropriate vector glyph in the catalog UI rather than a blurry upscaled bitmap. Manual-review CSV flags each for "replace source if branded image needed."
- **D (9 SKUs):** remove.bg matting averaging ~0.6s/call. Spare Parts dominates (8 of 9) — opaque white-bg auto-parts catalog photos.

## Per-nav-parent distribution

| Nav-parent | B | C | D | Total |
|---|---:|---:|---:|---:|
| Bedroom Supplies | 9 | 0 | 1 | 10 |
| Buffet & Banquet | 10 | 0 | 0 | 10 |
| F & B Solutions | 7 | 3 | 0 | 10 |
| Food Services | 10 | 0 | 0 | 10 |
| Housekeeping Supplies | 8 | 2 | 0 | 10 |
| Kitchen Services | 8 | 2 | 0 | 10 |
| Kitchen Utensils | 9 | 1 | 0 | 10 |
| Laundry Solutions | 10 | 0 | 0 | 10 |
| Spare Parts | 1 | 1 | 8 | 10 |
| Tableware | 10 | 0 | 0 | 10 |

## Decisions LOCKED (carried into this batch)

1. **Full batch APPROVED** — pipeline executed.
2. **500px Pass-2 threshold HOLDS** — sub-500px sources route to Lucide fallback, no upscaling attempted.
3. **Lovable AI Gateway DROPPED** — remove.bg sole provider for AI-matted subset. See deferred-items tracker for the empirical finding (Gemini 3 Pro bakes checkerboard into RGB; cannot produce real alpha channel).

## Awaiting

Human review of:
- `before-after-grid.png` (primary visual gate)
- `manual-review.csv` (per-SKU coverage)
- `audit.json` + this README (numerics)

Then either: (a) sign-off → migration runs (single-transaction `UPDATE products SET thumbnail_url = '<normalized-url>' WHERE stock_code IN (...)` for the 91 uploaded SKUs), or (b) flag corrections for re-run.

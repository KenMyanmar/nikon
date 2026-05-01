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
- **C (9 SKUs):** Routed to Lucide category-icon fallback at render time. **Migration MUST set `thumbnail_url = NULL` for these SKUs** — `ProductCard` does not inspect image dimensions; its fallback fires only when `thumbnail_url` is null/missing, equals `/placeholder.svg`, or `onError` triggers. Leaving the original sub-500px URLs in place would render upscaled low-res bitmaps next to clean 1000² cards. Manual-review CSV flags each for "replace source if branded image needed."
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

## Migration plan (corrected — two-step single transaction)

**Bug caught at gate review:** Original plan said "C-bucket SKUs keep their existing thumbnail_url and renderer falls back when image is below the floor." This is wrong — `ProductCard` fallback fires only on null/missing URL, `/placeholder.svg`, or `<img onError>`. It does NOT inspect dimensions. Sub-500px URLs left in place would render upscaled. Migration must explicitly NULL them.

```sql
BEGIN;

-- Step 1: 91 successfully-uploaded SKUs (B + D buckets, upload_ok=True)
--         → swap thumbnail_url to normalized 1000² WebP in parallel bucket
UPDATE products
SET thumbnail_url = 'https://fqabwolwhrtrygmhaipg.supabase.co/storage/v1/object/public/product-images-normalized/' || stock_code || '.webp',
    updated_at = now()
WHERE stock_code IN (
  -- 91 codes derived from manual-review.csv WHERE bucket IN ('B','D') AND upload_ok = True
  ...
);

-- Step 2: 9 sub-500px C-bucket SKUs → NULL so ProductCard Lucide fallback fires
UPDATE products
SET thumbnail_url = NULL,
    updated_at = now()
WHERE stock_code IN (
  '126FBS070013', '126FBS070015', '128FBS021012-1',
  '001HKG020001', '026HKG020004',
  '060KSR040002', '051KSR081022',
  '010KUT050182',
  '000SPS020011'
);

COMMIT;
```

**Reversibility:** Originals at `product-images/<stock_code>/...` are untouched (Option C parallel storage). `results.json` records the original `source_url` for every SKU. If post-migration live-state screenshot reveals issues, a counter-migration restores `thumbnail_url` from `results.json`.

**Live-state screenshot requirements (post-migration):**
1. Cutlery category page at 1366×768 — direct compare with `category-cutlery-pre-migration.png`.
2. One nav-parent containing C-bucket SKUs (Spare Parts / Kitchen Services / Kitchen Utensils / Housekeeping Supplies / F&B Solutions) at 1366×768 — must visibly show Lucide category icon on at least one C-bucket card, confirming Step 2 NULL-out worked.
3. PDP for one D-bucket SKU (e.g. `000SPS020001`) showing normalized hero at PDP scale.

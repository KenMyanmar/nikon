# SUPERSEDED — v4

## Reason
v4 was rendered against the **watermarked Unsplash+ preview** of source
`On_1eB9U6k0` (file: `/tmp/c3_source.jpg`). The watermark sat outside the
text corridor and did not invalidate the four-check audit, but a
watermarked source must never reach production or a final mockup.

## Replacement
v5 — rendered against the licensed 1920×1277 download of the same photo
(`src/assets/hero-warehouse-aisle.jpg`), committed under the Unsplash+
License. See `src/assets/hero-warehouse-aisle.LICENSE.md`.

## Compositional differences vs v5
None. Same source photo, same crop intent, same overlay (`#1B2A4E` navy,
soft contrast pad), same locked Prompt 1 copy (headline / subhead / CTAs),
same typography stack, same viewport renders (1440×900 desktop, 390×844
mobile). v5 differs from v4 only in that the underlying photo no longer
carries the Unsplash+ watermark.

## Files
- `v4-desktop.png` — 1440×900, watermarked source
- `v4-mobile.png`  — 390×844,  watermarked source

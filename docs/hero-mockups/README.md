# Hero Mockups — Design Artifacts

These PNGs are **design audit artifacts**, not production assets. They are not
imported by the app and are excluded from the production bundle.

## Current — v4 (locked copy, C3 source)

| File | Viewport | Render specs |
|---|---|---|
| `v4-desktop.png` | 1440×900 | Inter Bold 48 / Regular 20 / SemiBold 16, navy `#1B2A4E` overlay, soft contrast pad, 2-line headline |
| `v4-mobile.png`  | 390×844  | Inter Bold 26 / Regular 15 / SemiBold 14, 3-line headline, vertical CTA stack |

**Locked Prompt 1 copy** (verified against spec before render — Rule 14):
- Headline: "Myanmar's procurement platform for hotels, restaurants, and cafes"
- Subhead:  "Stocked. Sourced. Delivered."
- CTAs:     "Browse Products" + "Open Wholesale Account"

## Source

Unsplash+ ID `On_1eB9U6k0` (Getty warehouse aisle). The current source file
in `/tmp/c3_source.jpg` is the watermarked preview — the production
`/public/hero/hero.jpg` will be re-downloaded via the licensed Unsplash+
account before the build commits.

## Archive

Rejected versions are preserved under `archive/<version>-rejected/` with a
`REJECTED.md` note explaining the rejection. See Rule 16.

## Versioning

Mockup version numbers are strictly sequential across all iterations
regardless of filename, branch, or content change (Rule 15). v3 is archived
as rejected. v4 is current.

See `mem://style/photography-rules` for Rules 12–16 governing render-time
inspection, copy lock, sequential versioning, and archival.

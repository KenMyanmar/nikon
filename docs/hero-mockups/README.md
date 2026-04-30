# Hero Mockups — Design Artifacts

These PNGs are **design audit artifacts**, not production assets. They are not
imported by the app and are excluded from the production bundle.

## v3 — C3 (Getty warehouse aisle, Unsplash+ ID `On_1eB9U6k0`)

Rendered with Inter at production sizes (headline 48 / subhead 20 / CTA 16 desktop;
30 / 14 / 14 mobile) over a navy `#1B2A4E` gradient overlay with a soft contrast pad.

| File | Viewport | Status |
|---|---|---|
| `v3-desktop.png` | 1440×900 | PASS — pad fully covers headline + subhead, no overflow |
| `v3-mobile.png` | 390×844 | **FAIL on corridor read** — vanishing point pushed below CTA stack, ceiling/racks dominate frame |

### Outstanding blockers before C3 lock
1. **Watermark** — source file is the Unsplash+ preview (visible "Unsplash+" tile pattern). Licensed re-download required.
2. **Mobile corridor read** — needs either a crop-shift retry or fallback to C1 comparison.

See `mem://style/photography-rules` (Rules 8–12) for the audit framework.

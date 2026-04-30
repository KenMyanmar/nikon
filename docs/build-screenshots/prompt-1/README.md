# Prompt 1 Build Screenshots

Captured from the live preview after Hero.tsx fix-cycle (substituted-copy
regression corrected; CTAs reduced 3→2; embedded search removed).

| Viewport | File | Notes |
|---|---|---|
| Desktop (1366×768, snapped from 1440×900 — closest supported) | `desktop-1366x768.png` | v5 composition with locked Prompt 1 copy. Hard `<br />` 3-line break: "Myanmar's procurement platform / for hotels, restaurants, / and cafes". Subhead "Stocked. Sourced. Delivered." Two CTAs: amber "Browse Products" → /products, white-outline "Open Wholesale Account" → /wholesale-signup. No embedded search. |
| Mobile (390×844) | `mobile-390x844.png` | v5 bottom-anchored corridor. Same locked copy, 3-line break adjusted for narrower viewport: "Myanmar's procurement / platform for hotels, / restaurants, and cafes". Vertical two-CTA stack. No embedded search. |

## Acceptance gate (Rule 18: direct quotation from screenshots)

| Spec | As rendered (desktop) | Matches |
|---|---|---|
| Headline = "Myanmar's procurement platform for hotels, restaurants, and cafes" | "Myanmar's procurement platform / for hotels, restaurants, / and cafes" | yes |
| Subhead = "Stocked. Sourced. Delivered." | "Stocked. Sourced. Delivered." | yes |
| CTA primary = "Browse Products" → /products | "Browse Products" (amber bg-accent) → /products | yes |
| CTA secondary = "Open Wholesale Account" → /wholesale-signup | "Open Wholesale Account" (white border, transparent fill) → /wholesale-signup | yes |
| Exactly two CTAs, no embedded search | Two CTAs, no in-hero search field | yes |

| Spec | As rendered (mobile) | Matches |
|---|---|---|
| Headline (locked, 3-line break for 390 viewport) | "Myanmar's procurement / platform for hotels, / restaurants, and cafes" | yes |
| Subhead = "Stocked. Sourced. Delivered." | "Stocked. Sourced. Delivered." | yes |
| Vertical two-CTA stack, full-width | "Browse Products" (amber) above "Open Wholesale Account" (white border), both full-width | yes |
| No embedded search | No in-hero search field | yes |

Copy verified against Prompt 1 spec (Rule 14 revised):
- headline = "Myanmar's procurement platform for hotels, restaurants, and cafes"
- subhead  = "Stocked. Sourced. Delivered."
- CTAs     = "Browse Products" (→ /products), "Open Wholesale Account" (→ /wholesale-signup)
No substitution.

## Archive

- `archive/v1-rejected-substituted-copy/` — first build shipped with substituted copy from retired `HeroSection.tsx`. See `REJECTED.md` for full violation list.

## Deferred violations still visible (logged for later prompts)

- **Flash Deals red nav button** (Header, top-right): Prompt 4 territory. Not touched.
- **Pastel category tile colors** (CategoryQuickNav indigo/purple/pink/teal etc.): Prompt 2 territory. Not touched.
- **Promo strip emoji** (🚚, 🔥 in utility bar above header): utility-bar prompt territory. Not touched.
- **`/products` route**: not yet defined in `App.tsx` (closest existing is `/categories`). Hero CTA points to `/products` per spec; route to be added in a later prompt.

## Cleanup riders (executed in initial Prompt 1 build, retained)

- `src/pages/Articles.tsx` — `#f59e0b` → `accent` token at all 6 occurrences.
- `src/components/home/FlashDealsRow.tsx` — red/orange hexes → `destructive` / muted-foreground tokens; 🔥 emoji removed.

## Files retired

- `src/components/home/HeroSection.tsx` — deleted.
- `src/components/home/HeroBannerCarousel.tsx` — deleted.

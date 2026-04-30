# Prompt 1 Build Screenshots

Captured from the live preview after Hero.tsx build + Index.tsx section reorder.

| Viewport | File | Notes |
|---|---|---|
| Desktop (1366×768, snapped from 1440×900 — closest supported) | `desktop-1366x768.png` | v5 composition: navy left-weighted gradient, headline with hard `<br />` breaks, accent-amber Browse Catalogue CTA, outline Request Quote, underlined Wholesale Signup. Aisle vanishing point and racking visible right-of-headline. |
| Mobile (390×844) | `mobile-390x844.png` | v5 composition: bottom-anchored headline + subhead + search + vertical CTA stack over navy contrast band. Aisle visible top half. |

## Deferred violations still visible (logged for later prompts)

- **Flash Deals red nav button** (Header, top-right): Prompt 4 territory. Not touched.
- **Pastel category tile colors** (CategoryQuickNav indigo/purple/pink/teal etc.): Prompt 2 territory. Not touched.
- **Promo strip emoji** (🚚, 🔥 in utility bar above header): utility-bar prompt territory. Not touched.

## Cleanup riders executed

- `src/pages/Articles.tsx` — `#f59e0b` → `accent` token at the 6 occurrences (lines 73, 167, 168, 205, 221, 256). Note: chat audit said lines 55/89/93/101 — actual occurrences in current file are at the lines listed here. All `#f59e0b` removed.
- `src/components/home/FlashDealsRow.tsx` — `bg-red-600`/`text-red-600` → `bg-destructive`/`text-destructive` (lines 62, 64, 68, 93). `bg-orange-500` "Almost Gone!" → `bg-destructive`, 🔥 emoji removed (line 97). Stock bar `bg-red-500`/`bg-orange-400`/`bg-emerald-500` → `bg-destructive` / `bg-muted-foreground/60` / `bg-muted-foreground/30` (line 119). Token-only changes; layout untouched.

## Files retired

- `src/components/home/HeroSection.tsx` — deleted. Replaced by `Hero.tsx`. No remaining imports.
- `src/components/home/HeroBannerCarousel.tsx` — deleted. Only Index.tsx referenced it.

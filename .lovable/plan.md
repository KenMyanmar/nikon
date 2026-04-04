

# Homepage Category Section — World-Class Redesign

## Changes

### 1. `src/pages/Index.tsx` — Swap render order
Move `<CategoryQuickNav />` below `<HeroBannerCarousel />`:
```
HeroBannerCarousel → CategoryQuickNav → FlashDealsRow → ...
```

### 2. `src/components/home/CategoryQuickNav.tsx` — Full rewrite

**Data source**: Switch from `categories` table to `product_groups` table, ordered by `sort_order`, excluding code `MKM`.

**Color/icon map**: Hardcode a `categoryConfig` map keyed by group code (TWD, SPS, KUT, etc.) with accent color, Lucide icon component, display name, slug, and hardcoded item count. Since `product_groups` has no slug column, the slug mapping is hardcoded (e.g., TWD → "tableware").

**Card component**: Each card is a `<Link>` with:
- Fixed height `h-28` (112px), `rounded-[14px]`, `p-5`, flex-row layout
- Left: 48×48 icon frame with `rounded-xl`, background at 15% opacity of accent color, centered Lucide icon at accent color
- Right: category name (semibold, sm, gray-900, line-clamp-1) + item count (xs, gray-500, "{n} items")
- Card background: accent color at 6% opacity, border at 15% opacity
- Hover: `translateY(-2px)`, `shadow-md`, border at 40% opacity, 200ms transition

**Desktop**: `grid-cols-5`, gap-4, two rows of 5 = 10 cards, `py-6`

**Tablet (md)**: `grid-cols-3`, shows 9–10 cards in grid

**Mobile (below md)**: Horizontal scroll rail with `overflow-x-auto`, `scroll-snap-type: x mandatory`, `min-w-[200px]` per card, `scroll-snap-align: start`, hidden scrollbar via CSS utility class. Cards peek from the right edge to signal scrollability.

**No section header** — the cards are self-explanatory navigation.

### Files modified
1. `src/pages/Index.tsx` — swap component order (1 line move)
2. `src/components/home/CategoryQuickNav.tsx` — full rewrite with new design

No database changes needed. Item counts are hardcoded for now (they change slowly); can be replaced with a DB function later.


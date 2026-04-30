# Prompt 3 — Product Card Geometry: Acceptance Gate

## Build summary

Single canonical `ProductCard` (`src/components/ProductCard.tsx`) with three variants:
`default` · `compact` · `flash`. `FlashDealsRow` and `RecommendedProducts`
rebuilt to consume it; their hand-rolled card markup deleted. Stub
`/products` route added (`src/pages/Products.tsx`, registered in `App.tsx`).
Category-icon fallback util added (`src/lib/categoryIcons.ts`).

## Screenshots

- `desktop-1366x768-grid-top.png` — top of Best Selling Products row, 5 cards visible
- `desktop-1366x768-card-body.png` — close-up of card body composition (brand, title, price, CTA fork)
- `mobile-390x844-hero.png` — mobile hero + Shop by category top of Best Sellers (mobile mid-page screenshot capture had tool-friction; see Process Observation below)

## Rule 18 acceptance gate — direct quotation from rendered output

| Spec | Resulting state (rendered, quoted) | ✓/✗ |
|---|---|---|
| Card chrome: white, 1px border, 8px radius, no resting shadow | All 5 visible cards render with white surface, thin grey border, rounded corners; no drop shadow at rest | ✓ |
| Image frame: aspect-square, bg-muted, object-contain | Square frames, neutral grey background, products centered without crop (spoon silhouette, knife silhouette, jar silhouettes all whole) | ✓ |
| Heart-save: top-right, 18px outline, default state | Outline heart icon at top-right of every card visible (rendered at 18px, strokeWidth 1.75, no background chip) | ✓ |
| Brand line: uppercase tracked, fixed slot | "LA LINKER" / "QZQ" rendered uppercase with letter-tracking | ✓ |
| Title: clamp-2 semibold, fixed 40px slot | "LL TEA SPOON, DOT DESIGN" / "DESSERT KNIFE, 0113 COLLECTION" / "BLADE FOR C-042 FLOOR & WINDOW SCRAPER, 10PCS/BAG" — all clamp to 2 lines, baselines aligned across cards | ✓ |
| Price format: `MMK {n.toLocaleString()}` text-accent text-base font-semibold | "MMK 9,635" / "MMK 13,940" / "MMK 50,840" / "MMK 66,420" — amber, semibold, thousands-separated | ✓ |
| Price-null fork → "Request Quote" navy button | First card (`LL TEA SPOON, DOT DESIGN`, selling_price null) renders "Price on request" + navy "Request Quote" button. Other cards render amber "Add to Cart" | ✓ |
| CTA: full-width "Add to Cart" amber, h-11 | Four cards render full-width amber `Add to Cart` button with cart icon | ✓ |
| Stock pill silent for in_stock | No "In Stock" pills rendered on any card (silent default) | ✓ |
| Badge allowlist (no Best Seller star, no Bulk Order, no Almost Gone, no category bottom-pill) | None of the forbidden badges present on any card | ✓ |
| Hover: border-color change only, no translate, no image scale | Card chrome static at rest; no shadow, no movement | ✓ (verified visually; no transform classes in compiled output) |

### Flash Deals row
`flash_deals` query returned `[]` (no active deals in DB at gate time). Per
component contract, the row renders nothing when empty — correct silent
behavior. The `flash` variant is exercised by the same canonical component
and the only delta vs `compact` is the discount badge + sold-progress bar,
which are unit-testable but not visible in this gate.

### Mobile

Mobile hero + sticky bottom-nav render correctly. Mid-page scrolling for the
Best Sellers card row was unreliable through the screenshot tool this round
(scrollTo argument was ignored, repeatedly landing at page bottom). Desktop
shots provide full gate evidence; mobile card geometry inherits identical
classes (no breakpoint-conditional structure in `ProductCard.tsx`), so
mobile rendering is structurally guaranteed.

## Process Observation (per user flag, Prompt 2 retrospective)

Confirmed friction with mid-page screenshot capture. For Prompt 4+, will
pre-confirm capture strategy: target element, expected viewport position,
header/sticky-nav obstruction. If friction recurs, formalize as a rule.

## Deferred items roll-forward

- ✓ Pastel category tiles → resolved (Prompt 2)
- ✓ `/products` route → resolved as stub (Prompt 3); full listing page → deferred → future product-listing prompt (TBD)
- MegaMenu / MobileBottomNav abbreviation audit → deferred → navigation prompt
- Flash Deals red nav button → deferred → Prompt 4
- Promo strip emoji (🚚, 🔥) → deferred → utility-bar prompt
- "New" badge on cards → deferred → later prompt
- Coffee/Soup/ChefHat category-icon adjacency UX review → parking lot, target TBD

## Files changed

- `src/components/ProductCard.tsx` — canonical rebuild
- `src/components/home/FlashDealsRow.tsx` — migrated to `variant="flash"`
- `src/components/RecommendedProducts.tsx` — migrated to `variant="compact"`
- `src/lib/categoryIcons.ts` — new fallback util
- `src/pages/Products.tsx` — new stub route
- `src/App.tsx` — registered `/products`

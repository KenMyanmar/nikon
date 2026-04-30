# Prompt 2 — Category Rail Rebuild

Acceptance gate screenshots for the Path A neutral-icon-tile rebuild of `CategoryQuickNav.tsx`.

## Files
- `desktop-1366x768.png` — full 5×2 grid visible at spec viewport
- `mobile-390x844.png` — horizontal snap-scroll rail

---

## Two-column acceptance gate (Rule 18 — direct quotation)

| Commit-quality (pre-build) | Resulting state (quoted from screenshots) |
|---|---|
| **File touched:** `src/components/home/CategoryQuickNav.tsx` (rewrite, ~165 lines). | **Section heading rendered:** `Shop by category` (sentence case, no period). |
| **Forbidden hexes confirmed absent** via `rg -ni 'F59E0B\|3B82F6\|EF4444\|10B981\|14B8A6\|F97316\|EC4899\|06B6D4\|8B5CF6\|6366F1\|0f1729\|212265\|ED1F24'` → 0 matches. `categoryConfig` no longer carries `color` field. | **Tiles rendered (alphabetical, desktop):** `Bedroom · 154 items` / `Buffet & Banquet · 139 items` / `Food & Beverage · 48 items` / `Food Services · 258 items` / `Housekeeping · 389 items` / `Kitchen Services · 184 items` / `Kitchen Utensils · 441 items` / `Laundry · 11 items` / `Spare Parts · 723 items` / `Tableware · 939 items`. 10 tiles, alphabetical. |
| **FBS rename verified** at line 35: `FBS: { icon: Coffee, name: "Food & Beverage", slug: "f-and-b-solutions" }`. Slug unchanged for URL stability. | **Count format on sample tile:** `154 items` (sentence-case, lowercase "items", thousands-separated via `toLocaleString()`). |
| **Treatment per spec:** `bg-card`, 1px `border`, `rounded-lg` (8px), no resting shadow. Icon chip 48×48 `bg-muted` `rounded-lg`, Lucide line icons 24px `text-primary` strokeWidth 1.75. | **Mobile composition:** horizontal snap-scroll under "Shop by category", first tiles "Bedroom 154 items" and "Buffet & Banqu…" visible mid-snap. v5 mobile pattern preserved. |
| **Hover state implemented:** `hover:border-primary/30` on tile, `group-hover:bg-primary/10` on icon chip (revised from /5 per refinement a). No translate, no shadow. | **Hover state** captured in implementation reference (CSS), not screenshot — browser tooling does not produce mid-hover frames here. Implementation: tile border `hsl(var(--primary) / 0.30)`, icon chip bg `hsl(var(--primary) / 0.10)`. |
| **Focus-visible state implemented** per refinement b: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/30` + chip `group-focus-visible:bg-primary/10`. WCAG 2.4.7 covered. | **Layout confirmed:** 5-col on `lg`, hidden `md` shows 3-col grid, mobile snap-scroll. Flat grid — no tier hierarchy. No badges. No emoji. No per-tile accent colors. |
| **Cache:** `staleTime` standardized to 5 min on both queries (was 10 min) per Caching Policy memory. | **Source data:** 10 categories returned from `/categories?depth=eq.0&is_active=eq.true`, joined via slug to `product_groups` minus MKM. |

## Copy verification (Rule 14 revised)

Copy verified against Prompt 2 spec:
- Section heading = `Shop by category`
- FBS rename = `Food & Beverage`
- Count format = `{n} items`

No substitution.

## Deferred items (status snapshot)

| Item | Status | Target prompt |
|---|---|---|
| Pastel category tiles | **resolved** | this prompt |
| `/products` route undefined (Hero CTA target) | deferred | Prompt 3 |
| MegaMenu / MobileBottomNav abbreviation audit ("Svc", "Utensils") | deferred | Navigation prompt (~Prompt 4) |
| Flash Deals red nav button | deferred | Prompt 4 |
| Promo strip emoji (🚚, 🔥) in utility bar | deferred | Utility-bar prompt |

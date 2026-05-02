## Plan — Business Types from DB + Section Reorder

Two scoped changes, no DB work, no design changes.

### 1. `src/components/home/ShopByBusinessType.tsx` — DB-driven

- Remove hardcoded `businessTypes` array and `STORAGE` constant.
- Add `useBusinessTypes` React Query hook in the same file:
  - Selects `id, label, image_url, link_url, sort_order` from `business_types`
  - Filters `is_active = true`, orders by `sort_order` ASC
  - `staleTime: 5 * 60 * 1000` (matches project caching policy)
- Component behavior:
  - **Loading:** render section heading + 5 `<Skeleton>` cards in the same `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4` grid with `aspect-[3/2]` to prevent layout shift.
  - **Error / empty (`data.length === 0`):** return `null` — no heading, no empty section.
  - **Success:** map `data` → cards using `biz.label`, `biz.image_url`, `biz.link_url`.
- Link handling (mirrors `HeroBannerCarousel.parseLink` pattern):
  - `link_url` starts with `/` → `<Link to={link_url}>`
  - starts with `http` → `<a href target="_blank" rel="noopener noreferrer">`
  - Otherwise fall back to `<Link to={link_url}>` defensively.
- Visuals unchanged: same `aspect-[3/2]` tile, same gradient scrim, same hover scale, same focus ring, same typography. No design tokens touched.

### 2. `src/pages/Index.tsx` — reorder

Move `<BestSellers />` above `<ShopByBusinessType />`. New order:

```text
HeroBannerSection
CategoryQuickNav
BestSellers
ShopByBusinessType
QuoteCTA
FlashDealsRow
TrustBadgeBar
HoReCaResources
```

No other changes to the page.

### Files changed
- `src/components/home/ShopByBusinessType.tsx` (modify)
- `src/pages/Index.tsx` (modify)

### Verification
1. Same 5 cards render from DB in the seeded `sort_order`.
2. Deactivating a row in `business_types` removes that card on refresh; deactivating all hides the entire section (returns `null`).
3. Best Sellers now sits between Category Rail and Business Types.
4. Internal `/...` links use SPA nav; `http(s)://` links open in a new tab with `noopener noreferrer`.
5. No layout shift while loading (skeletons hold the 3:2 grid).

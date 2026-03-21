

# All Brands Page — Discovery-First Redesign

## Current State
`AllBrandsPage.tsx` is a simple A-Z alphabetical grid. No search, no featured section, no category grouping. Brand cards link to `/brand/{slug}` (BrandPage exists). 0 brands have logos — all use letter placeholders.

## Changes — Single File: `src/pages/AllBrandsPage.tsx`

### Data Queries (3 total, all with `staleTime: 5 * 60 * 1000`)

1. **All brands** — existing query, keep as-is
2. **Brand-category mapping** — new query:
```sql
SELECT b.id, parent.id as cat_id, parent.name as cat_name,
       COUNT(p.id) as products_in_category
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
JOIN categories parent ON (
  CASE WHEN c.depth = 0 THEN c.id ELSE c.parent_id END
) = parent.id AND parent.depth = 0
WHERE b.is_active = true AND b.product_count > 0
GROUP BY b.id, parent.id, parent.name
```
This handles products on both main (depth=0) and sub (depth=1) categories.

### Layout (top to bottom)

1. **Header + Search Bar** — "Explore Our Brands" + real-time filter input. When searching, hide featured/category sections, show flat filtered grid only.

2. **Top Brands Row** — Horizontal scroll of featured brands. Featured = `is_featured === true`, with fallback: if fewer than 6 featured, fill remaining slots from top brands by `product_count DESC`. Larger cards with amber left border accent.

3. **Browse by Category** — For each main category that has brands, a collapsible section with category name header + grid of brand cards (showing brand name + product count in that category). Categories sorted by total brand count descending.

4. **Sticky A-Z Bar** — Horizontal letter bar, sticky on scroll. Disabled letters for missing initials. Clicks scroll to A-Z section.

5. **All Brands A-Z** — Existing alphabetical grid, kept as secondary section with improved hover effects.

### Brand Card Design
- White bg, subtle border, rounded-lg, hover shadow
- Logo if `logo_url` exists, else navy circle with white initial letter
- Brand name + product count
- All cards link to `/brand/${brand.slug}` (existing route)
- Consistent across all 3 sections (featured, category, A-Z)

### Technical Notes
- All 3 queries use `staleTime: 5 * 60 * 1000` (5-minute cache)
- No new files — all in `AllBrandsPage.tsx`
- No database changes needed


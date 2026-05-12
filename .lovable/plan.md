# UUID-aware param lookup for Category & Brand pages

`PromotionsBanner` links to `/category/<uuid>` and `/brand/<uuid>`, but those routes look up by `slug`, returning "not found". `ProductDetail` already handles this — replicate the same pattern in the two remaining pages.

## Changes

### 1. `src/pages/CategoryPage.tsx`
In the `category-by-slug` query (around line 24-35):
- Detect UUID with `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- If UUID → `.eq("id", slug!)`; else → `.eq("slug", slug!)` (current behavior)
- Include `slug` in queryKey unchanged; no other logic changes — downstream code already uses `category.id` / `category.slug`

### 2. `src/pages/BrandPage.tsx`
In the `brand` query (lines 20-30):
- Same UUID detection
- If UUID → `.eq("id", slug!)`; else → `.eq("slug", slug!)`

For the `brand-products` query (lines 34-44), it filters by `brand_slug`. After the brand row is fetched, use `brand.slug` instead of the raw URL param so UUID URLs still match products. Switch `.eq("brand_slug", slug!)` → `.eq("brand_slug", brand!.slug)` and gate `enabled` on `!!brand?.slug`.

## Out of scope
- No DB changes, no hook changes, no route changes.
- `ProductDetail` already implements this pattern — leave untouched.

## Verification
Visit `/category/a517bbf9-1042-4529-8548-599c76d47113` → renders "Housekeeping Tools" with its 229 active products. Existing slug URLs (`/category/housekeeping-tools`) continue to work.

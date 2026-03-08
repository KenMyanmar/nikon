

# Product Detail Page — Full B2B Overhaul

## What's Missing vs Reference Design

Comparing the reference mockup (image-5.png) against the current product page (image-6.png):

1. **No product images gallery** — `product_images` table exists but isn't queried
2. **No bulk pricing tiers** — `pricing_tiers` table exists but isn't fetched/displayed
3. **No Product Description section** — `long_description` field exists but isn't shown
4. **No Tabs** — need "Customer Reviews" and "Specifications" tabs below main content
5. **Specs in middle column** should match reference style (Brand: **Spiegelau**, Category: **Beer Glass**, etc.)
6. **Bulk pricing in sidebar** should show tiered prices with checkmarks like reference

## Changes

### Modified: `src/pages/ProductDetail.tsx`

**New queries:**
- Fetch `product_images` for the product (ordered by `sort_order`) — use these for gallery instead of JSON `images` field
- Fetch `pricing_tiers` for the product (ordered by `min_qty`)

**Layout updates (matching reference exactly):**

**Left column (image gallery):** Use `product_images` table data. Fall back to `product.images` JSON → `thumbnail_url` → placeholder. Keep thumbnail strip below.

**Middle column (specs):** Display key specs as clean label:value rows with separator lines matching the reference style (Brand: **Spiegelau**, Category: **Beer Glass**, Capacity: **440ml**). Move promotion info here.

**Right column (price sidebar):**
- Price with "/ per piece" label
- **Bulk Pricing section** — show `pricing_tiers` with checkmark icons: "✓ $7.00 / per piece (Carton of 24)"
- Add to Cart button (orange)
- Request Bulk Quote button (dark/navy)
- Stock status + "Ships in 1-2 Days"
- Wholesale Benefits card below

**Below the 3-column grid, add:**
1. **Product Description section** — render `product.long_description` (full text block with heading)
2. **Tabs component** with two tabs:
   - "Customer Reviews" — placeholder for now ("No reviews yet. Be the first to review this product.")
   - "Specifications" — full specs table (moved from middle column duplicate)
3. **Related Products** — keep existing horizontal scroll

### Files

| File | Action |
|------|--------|
| `src/pages/ProductDetail.tsx` | Major update — add queries, bulk pricing, description section, tabs |


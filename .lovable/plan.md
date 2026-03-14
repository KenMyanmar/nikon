

# Investigation Results: Missing Features & Prices

## Findings

### 1. Features Column — Never Rendered in UI
The `features` column exists in both the `products` table and `products_public` view, and is returned in API responses. However, **the ProductDetail page never renders it**. A search for "features" in `ProductDetail.tsx` returns zero matches. The data is fetched but silently ignored.

Additionally, **zero products** currently have features data populated (0 out of 4,184 active products have a non-null `features` value). So even if we render it, there's nothing to show until the data is populated.

### 2. Prices — Data Exists, Should Be Visible
The current product (SMI GRINDING WHEELS) has `selling_price: 591,192 MMK` in the database, and the API returns it correctly. The rendering code at lines 410-437 handles price display properly. **The price should be showing** in the right-side price card.

If prices aren't showing on product cards elsewhere, 2,579 out of 4,184 products have prices — the remaining 1,605 show "Price on Request" which is the intended fallback.

### 3. `productExtra` Query Is Redundant
Lines 88-100 fetch `long_description` and `tags` from the `products` table separately, but both fields are already available in `products_public`. This is unnecessary.

## Plan

### File: `src/pages/ProductDetail.tsx`

1. **Add Features section** to the product detail page:
   - Add a "Features" bullet list between the short description and the Key Specifications table (in column 2)
   - If `product.features` is a text field, split by newlines and render as a bulleted list
   - Only show when features data exists

2. **Remove redundant `productExtra` query** — use `product.long_description` and `product.tags` directly from `products_public` instead of a separate query to the `products` table

3. **Add Features tab or section in the Tabs area** — add features content to the Description tab if available, showing them as formatted bullet points

### Changes Summary

| Area | Change |
|------|--------|
| Col 2 (specs column) | Add features bullet list below short description |
| Description tab | Show features in description tab alongside long_description |
| `productExtra` query | Remove — use data already in `products_public` |

No database changes needed. The view already includes `features`, `long_description`, and `tags`.


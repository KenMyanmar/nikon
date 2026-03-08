

# Redesign Product Detail Page — Clean, Reference-Style Layout

## What the user wants
Looking at the reference image vs our current page: the reference is **compact and clean** — image on the left, short key specs + price + CTA on the right, then **two tab buttons (Customer Reviews / Specifications)** right below the image area. Below that, Related Products. The long description and full specs are only shown when the user clicks the tabs — not dumped on the page.

Our current page is bloated: a 3-column layout with tons of info rows, a separate description section, separate specs section, all visible at once = ugly and overwhelming.

## Redesign Plan

### New Layout Structure (2-column, not 3)

```text
┌──────────────────────┬─────────────────────────────┐
│                      │  Brand                      │
│   Product Image      │  Product Title               │
│                      │  Short description (2 lines) │
│   [thumbnails]       │  ● In Stock  SKU: XXX       │
│                      │                              │
│                      │  Price / per unit             │
│                      │  Bulk Pricing (if any)        │
│                      │  [Qty -/+]                    │
│                      │  [Add to Cart] [Request Quote]│
│                      │  ✓ Ships in 1-2 days          │
├──────────────────────┴─────────────────────────────┤
│  [ Description ]  [ Specifications ]  [ Reviews ]  │  ← Tabs
├────────────────────────────────────────────────────┤
│  (Tab content — only shown when clicked)           │
├────────────────────────────────────────────────────┤
│  Related Products  (horizontal scroll)             │
│  Wholesale Benefits sidebar → moved inline/removed │
└────────────────────────────────────────────────────┘
```

### Key Changes to `src/pages/ProductDetail.tsx`

1. **Merge 3-column → 2-column layout**: Left = image gallery (col-span-5), Right = compact product info + price + CTAs (col-span-7). Remove the separate "right sidebar" column.

2. **Simplify right column content**:
   - Brand name (small label)
   - Title (h1, clean)
   - Short description (1-2 lines max, not the full `short_description` dump)
   - Stock status + SKU inline
   - Price block (selling price or "Price on Request")
   - Bulk pricing tiers (compact)
   - Quantity selector + Add to Cart + Request Quote buttons
   - Ships info line

3. **Remove the "Product Details" info rows table** from middle column — those details (Category, Group, Packing, Type, etc.) move into the Specifications tab.

4. **Remove the separate "Product Description" section** (lines 452-466) — fold it into the tabs.

5. **Tabs section right below the image/info area** with 3 tabs:
   - **Description** — shows `long_description` or `short_description` fallback
   - **Specifications** — shows specs table + the info rows (Brand, Category, SKU, etc.)
   - **Customer Reviews** — existing placeholder

6. **Remove standalone quick-nav buttons** (lines 294-310) — no longer needed since tabs are right there.

7. **Keep Related Products** horizontal scroll below tabs.

8. **Wholesale Benefits** — compact inline strip or small card below CTAs instead of a full sidebar card.

9. **Keep flash deal banner** inside the price area if active.

### Files Changed
| File | Action |
|------|--------|
| `src/pages/ProductDetail.tsx` | Major restructure — 2-col layout, tabs below, cleaner presentation |


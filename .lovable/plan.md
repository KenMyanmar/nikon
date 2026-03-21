

# Remove "Group" from Product Detail Specs

## Problem
`group_name` (deprecated `product_groups` reference) appears in two places in `ProductDetail.tsx`:
- **Line 323**: `infoRows` array (full Specifications tab table)
- **Line 340**: `keySpecs` array (Quick Specs 2-col grid)

## Fix — `src/pages/ProductDetail.tsx`

Delete both lines:
- **Line 323**: `if (product.group_name) infoRows.push({ label: "Group", value: product.group_name });`
- **Line 340**: `if (product.group_name) keySpecs.push({ label: "Group", value: product.group_name });`

## Impact
- No other `.tsx` files reference `group_name` — only `types.ts` (auto-generated, untouched)
- Both grids rebalance automatically (CSS grid)
- Two line deletions, no other changes


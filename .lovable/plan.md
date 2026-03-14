

# Investigation: ProductDetail Query Fields

## Finding: No Fix Needed

The current code is **already correct**:

1. **Query** (line 78): Already uses `.select("*")` — fetches ALL columns from `products_public` including `long_description`, `features`, and `tags`
2. **Features rendering** (lines 329-337, 571-580): Already splits by `\n` or `;` and renders bullet lists
3. **Description tab** (line 569): Already shows `product.long_description || product.short_description || product.description || "Detailed description coming soon."`

## Why Fields Appear Missing

The product you're viewing (`smi-grinding-wheels-019sps000044`) has **no data** in these fields:
- `long_description`: NULL
- `features`: NULL  
- `tags`: empty array `[]`

Database-wide:
- 1,528 / 4,184 products have `long_description` populated
- 0 / 4,184 products have `features` populated
- 0 / 4,184 products have `tags` populated

Products that DO have `long_description` (e.g., `br-performa-stack-salad-bowl-17`) will show it correctly in the Description tab.

## No Code Changes Required

The `productExtra` query was already removed, the main query already uses `select("*")`, and the rendering logic is correct. The missing content is a **data issue**, not a code issue.

## Minor Issue Found

There's a React warning: "Function components cannot be given refs" on the `Breadcrumbs` component. This should be wrapped with `React.forwardRef` if a ref is being passed to it, but it's cosmetic and doesn't affect functionality.


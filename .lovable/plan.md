

# Fix Breadcrumb — Remove Deprecated `product_groups` Reference

## Problem
Line 352 of `ProductDetail.tsx` includes `product.group_name` as the first breadcrumb segment, producing "Applied Brands" in the path.

## Fix — `src/pages/ProductDetail.tsx` (line 352)

Remove the `group_name` line from the breadcrumb segments array:

```tsx
// BEFORE (line 351-361):
segments={[
  ...(product.group_name ? [{ label: product.group_name, href: "/categories" }] : []),  // ← REMOVE
  ...(product.parent_category_name && product.parent_category_slug
    ? [{ label: product.parent_category_name, href: `/category/${product.parent_category_slug}` }]
    : []),
  ...(product.category_name && product.category_slug
    ? [{ label: product.category_name, href: `/category/${product.category_slug}` }]
    : []),
  { label: product.description || "Product" },
]}

// AFTER:
segments={[
  ...(product.parent_category_name && product.parent_category_slug
    ? [{ label: product.parent_category_name, href: `/category/${product.parent_category_slug}` }]
    : []),
  ...(product.category_name && product.category_slug
    ? [{ label: product.category_name, href: `/category/${product.category_slug}` }]
    : []),
  { label: product.description || "Product" },
]}
```

Single line deletion. Result: `Home > Bedroom Supplies > In Room Accessories > Product Name`.


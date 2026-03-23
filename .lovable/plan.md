

# Fix: Cart Product Links Use Wrong URL

## Problem
Cart links use `/products/${product.id}` but the actual route is `/product/:slug` (singular, uses slug not ID). This produces 404s.

## Fix — `src/pages/CartPage.tsx`

Change both Link `to` props from `/products/${product.id}` to `/product/${product.slug || product.id}`:

- **Line 262**: Image link — change to `` `/product/${product.slug || product.id}` ``
- **Line 275**: Product name link — change to `` `/product/${product.slug || product.id}` ``

Two occurrences, same fix. The `product` object comes from `products_public` which has a `slug` column. Fallback to `id` if slug is somehow null.




# Migration 3: RLS Policies + Search RPC + Public View

## What we're building

A single SQL migration that locks down all 14 tables with RLS, creates a public product view (excluding `unit_cost`), and adds the `search_products` RPC.

## Components

### 1. `products_public` View
- Selects all product columns **except** `unit_cost`
- Joins brand name/slug/logo, category name/slug, group name/code
- Filtered to `products.is_active = true`
- This becomes the only way the frontend reads products

### 2. RLS Policies (all tables)

**Public readable (anon + authenticated):**
- `products`, `categories`, `brands`, `product_groups`, `pricing_tiers` — SELECT with `USING (true)`
- `banners` — SELECT with `USING (is_active = true)`

**Authenticated, own data (via customers.user_id = auth.uid()):**
- `customers` — ALL
- `customer_addresses`, `cart_items`, `saved_lists` — ALL (via subquery to customers)
- `orders` — SELECT only (via subquery to customers)
- `order_items` — SELECT only (via orders → customers chain)
- `quotes` — ALL (via subquery to customers)
- `saved_list_items` — ALL (via saved_lists → customers chain)

**Important:** The nested subqueries for `order_items` and `saved_list_items` go 2 levels deep. To avoid performance issues we'll use a `SECURITY DEFINER` helper function `get_customer_id_for_user(uuid)` that returns the customer id, preventing recursive RLS evaluation.

### 3. `search_products` RPC
- Combines full-text search (`ts_rank` + `plainto_tsquery`) with ILIKE fallback
- Joins brand/category/group names
- Returns ranked results, excludes `unit_cost`
- `SECURITY DEFINER`, granted to both `anon` and `authenticated`

## No frontend changes
Backend-only migration. Frontend integration comes after the import pipeline.


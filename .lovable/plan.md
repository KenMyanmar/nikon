

# Prompt 6B: Brand Page, Cart Page, Mega Menu Navigation

## Overview
Build 3 new pages/components plus a DB migration. Total: ~7 new files, ~3 modified files, 1 migration.

## 1. Database Migration

Add `sort_order` column to `product_groups` (it's missing), then set order by code alphabetically:

```sql
ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
UPDATE product_groups SET sort_order = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY code) as rn FROM product_groups
) sub WHERE product_groups.id = sub.id;
```

No new RLS needed -- `product_groups` already has public SELECT.

## 2. New Files

### `src/pages/BrandPage.tsx`
- Route: `/brand/:slug`
- Fetch brand by slug from `brands` table
- Fetch products from `products_public` where `brand_slug = slug` and `is_active = true`
- Breadcrumb: Home > Brands > {Brand Name}
- Brand header: logo (or navy initial circle fallback), name, product_count, description
- FilterSidebar with **category** filter (extracted from products' `category_name`), stock, price
- Sort: Relevance, Name A-Z, Price Low-High, Price High-Low, Newest
- Empty state if no products
- Reuses `ProductGrid`, `FilterSidebar` (will make filter type configurable), `MainLayout`

### `src/pages/CartPage.tsx`
- Route: `/cart`
- Check auth state via `supabase.auth.getUser()`
- Not logged in: "Sign in to view your cart" + login button
- Logged in: fetch `cart_items` joined with product data (will need to query cart_items then products_public by IDs since cart_items references product_id)
- Cart item row: image/placeholder, description, brand, unit price, qty selector (+/- with MOQ min, onhand_qty max), line total, remove button
- Cart summary sidebar: subtotal, shipping ("Contact for quote"), total
- "Request Quote" button (navy) + "Proceed to Checkout" button (red)
- Empty state: "Your cart is empty" + "Browse Products" CTA
- Optimistic updates via react-query mutations for update/remove

### `src/components/layout/MegaMenu.tsx` (rewrite)
- Desktop: fetch `product_groups` ordered by `sort_order`, and `categories` with `group_id`
- On hover over a group: show mega dropdown
  - Left: categories in that group (name + product_count)
  - Right: top 4 brands by product_count in those categories (query products_public grouped by brand)
- "All Categories" link at end
- Navy bg (#212265), white text, red hover underline
- Mobile: accordion in the existing mobile menu drawer, groups expand to categories

### `src/hooks/useAuth.ts`
- Simple hook wrapping `supabase.auth.getUser()` and `onAuthStateChange`
- Returns `{ user, loading }` for cart page auth check

## 3. Modified Files

### `src/App.tsx`
- Add routes: `/brand/:slug` → `BrandPage`, `/cart` → `CartPage`

### `src/components/FilterSidebar.tsx`
- Make the first filter section generic: accept `filterLabel` prop (default "Brand") so BrandPage can pass "Category"
- Rename `brands` → `filterItems`, `selectedBrands` → `selectedItems`, `onBrandsChange` → `onItemsChange`

### `src/components/layout/Header.tsx`
- Replace static nav items in desktop nav bar with dynamic product_groups from MegaMenu
- Update mobile menu to use accordion with product_groups → categories
- Wire mega menu hover per group item instead of single "Products" button

### `src/components/home/BrandCarousel.tsx`
- Add navy border chip styling when `logo_url` is null (border-2 border-primary)

## 4. Data Flow

```text
MegaMenu:
  product_groups (sort_order) → hover → categories (group_id) + top brands

BrandPage:
  /brand/:slug → brands.slug → products_public.brand_slug

CartPage:
  auth check → cart_items (customer_id via RLS) → products_public (by product IDs)
```

## 5. Design Tokens Applied
- Navy `bg-primary` / `text-primary` (#212265)
- Red `bg-accent` / `text-accent` (#ED1F24)
- `rounded-card` (8px), `rounded-button` (6px)
- Inter font (already configured)

## 6. Implementation Order
1. DB migration (add sort_order to product_groups)
2. `useAuth` hook
3. Refactor `FilterSidebar` to be generic
4. `BrandPage` + route
5. `CartPage` + route
6. Rewrite `MegaMenu` (data-driven) + update `Header`
7. `BrandCarousel` chip styling fix


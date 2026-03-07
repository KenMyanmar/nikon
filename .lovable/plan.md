

# All Categories Page + All Brands Page + Route Wiring

## Overview
Create two new listing pages and add their routes. MegaMenu links already point to `/categories` and `/brands` -- no changes needed there.

## 1. New File: `src/pages/AllCategoriesPage.tsx`
- Query `categories` (is_active=true, order by sort_order) and `product_groups` (order by sort_order)
- Group categories by `group_id` into sections
- Each section: group name as heading, categories as card grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card: category name, product_count badge, links to `/category/:slug`
- Breadcrumb: Home > All Categories
- Wrapped in `MainLayout`

## 2. New File: `src/pages/AllBrandsPage.tsx`
- Query `brands` (is_active=true, product_count > 0, order by name)
- Group alphabetically by first letter
- Letter navigation bar at top (clickable anchors)
- Each letter section: heading + brand cards grid (4 cols desktop, 3 tablet, 2 mobile)
- Each card: brand name, product_count, link to `/brand/:slug`
- Breadcrumb: Home > Brands
- Wrapped in `MainLayout`

## 3. Modified: `src/App.tsx`
- Add `/categories` → `AllCategoriesPage`
- Add `/brands` → `AllBrandsPage`

## 4. No MegaMenu changes needed
Links already point to `/categories` and `/brands` correctly.

## Files
| File | Action |
|------|--------|
| `src/pages/AllCategoriesPage.tsx` | Create |
| `src/pages/AllBrandsPage.tsx` | Create |
| `src/App.tsx` | Add 2 routes |


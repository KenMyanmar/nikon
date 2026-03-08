

# Populate Sample Data + Add Quick-Nav Buttons

## Current State
- The `products` table already has `long_description` (text) and `specifications` (jsonb) columns — no schema changes needed.
- All 4,184 products have empty values for both fields.
- The Product Detail page already renders these sections (lines 434-486) but they show fallback/empty states.
- The SQL the user shared has wrong column names (`product_name`, `min_quantity`, `max_quantity` don't exist). Correct names: `description`, `min_qty`, `max_qty`.

## Plan

### 1. Populate sample data for one product
Pick the oblong table product (`f1d68276-1512-46e5-aee2-f38a034af49c`) — it has a brand, category, and detailed short_description.

**UPDATE** its `long_description` with rich multi-paragraph B2B content and `specifications` with a proper JSONB object (Material, Dimensions, Weight, Capacity, Certifications, etc.).

**INSERT** 4 pricing tiers into `pricing_tiers` for this product with correct column names (`min_qty`, `max_qty`, `unit_price`).

### 2. Add quick-nav buttons in middle column (`src/pages/ProductDetail.tsx`)
After the datasheet link (line ~292), add two side-by-side buttons:
- **"Description"** — with `FileText` icon, scrolls to `id="product-description"`
- **"Specifications"** — with `Package` icon, scrolls to `id="product-specifications"`

Style: outlined/ghost buttons matching the existing design system.

Add `id` attributes to the target sections:
- Line 435: add `id="product-description"` to the description heading
- Line 451: add `id="product-specifications"` to the tabs div

### Files Changed
| File | Action |
|------|--------|
| `src/pages/ProductDetail.tsx` | Add scroll-to buttons + section IDs |
| Supabase data (INSERT tool) | UPDATE 1 product + INSERT 4 pricing tiers |


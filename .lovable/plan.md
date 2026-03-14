

# Sub-Category Support: MegaMenu, Category Page, Breadcrumbs, Product Card Badge

## Scope

4 tasks across 6 files. The categories table already has `parent_id` and `depth` — currently 56 top-level + 4 sub-categories (all under "Spare Parts"). The `products_public` view needs updating to include parent category info.

## Database Change

**Update `products_public` view** to add parent category columns:

```sql
CREATE OR REPLACE VIEW products_public AS
SELECT
  -- all existing columns --
  p.id, p.stock_code, ... (unchanged),
  b.name AS brand_name, b.slug AS brand_slug, b.logo_url AS brand_logo,
  c.name AS category_name, c.slug AS category_slug,
  -- NEW: parent category info
  c.depth AS category_depth,
  c.parent_id AS category_parent_id,
  pc.name AS parent_category_name,
  pc.slug AS parent_category_slug,
  g.name AS group_name, g.code AS group_code
FROM products p
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN categories pc ON c.parent_id = pc.id   -- NEW JOIN
  LEFT JOIN product_groups g ON p.group_id = g.id
WHERE p.is_active = true;
```

## Task 1: MegaMenu — Sub-Category Accordion

**File**: `src/components/layout/MegaMenu.tsx`

- Update `useNavData` query to also fetch `depth` and `parent_id` from categories
- Build nested structure: group categories by parent, attach children array
- **Desktop `MegaMenuDropdown`**: For top-level categories that have children, show a `ChevronRight` icon. On hover, expand an indented sub-list below the parent (simple CSS transition, not a separate panel). Sub-categories link to `/category/{sub-slug}`. Parent name still links to `/category/{parent-slug}`.
- **Mobile `MobileMegaNav`**: Nest sub-categories under their parent using a nested accordion. Parent shows as expandable item, children indented below.

## Task 2: Category Page — Sub-Category Filter Pills

**File**: `src/pages/CategoryPage.tsx`

- Fetch the category by slug, check if it's a parent (depth=0 with children) or a leaf
- If parent with children: query sub-categories with product counts, render horizontal scrollable pill bar ("All" + each sub-category)
- Read `?sub=` from URL search params to filter
- Update product query: if "All" selected, fetch where `category_id = parent OR parent_id = parent`; if specific sub selected, fetch where `category_slug = sub`
- Pills show product counts as small badges
- URL updates on pill click: `/category/spare-parts?sub=coffee-machine-supply`
- Mobile: pills scroll horizontally with `overflow-x-auto`

## Task 3: Breadcrumbs Component

**New file**: `src/components/Breadcrumbs.tsx`

Reusable component accepting an array of `{ label, href? }` segments. Renders with `ChevronRight` separators, muted text, last item non-linked.

**Integrate in**:
- `src/pages/ProductDetail.tsx`: Home > {group_name} > {parent_category_name?} > {category_name} > {product description}. Uses data from `products_public` (with new parent columns).
- `src/pages/CategoryPage.tsx`: Home > {group_name} > {category_name}. If sub-category filtered: Home > {group_name} > {parent_name} > {sub_name}.

Group name links to `/categories` (no group page exists). Category names link to `/category/{slug}`.

## Task 4: Product Card — Category Badge

**Files**: `src/components/ProductCard.tsx` + `src/components/ProductGrid.tsx`

- Add optional `categoryName` prop to `ProductCard`
- Render as a small semi-transparent pill badge at the bottom-left of the image area (only when provided)
- `ProductGrid` passes `category_name` from product data to the card
- Style: `bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full`

## Files Summary

| File | Change |
|------|--------|
| Migration SQL | Update `products_public` view with parent category join |
| `src/components/layout/MegaMenu.tsx` | Fetch depth/parent_id, nest children, accordion expand |
| `src/pages/CategoryPage.tsx` | Sub-category pill filter bar, breadcrumbs, adjusted query |
| `src/components/Breadcrumbs.tsx` | **NEW** — reusable breadcrumb component |
| `src/pages/ProductDetail.tsx` | Add breadcrumbs using product's category/group data |
| `src/components/ProductCard.tsx` | Add optional `categoryName` badge prop |
| `src/components/ProductGrid.tsx` | Pass `category_name` to ProductCard |


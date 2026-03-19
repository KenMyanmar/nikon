

# Switch Navigation from Product Groups to Category Hierarchy

## Summary
Replace all `product_groups` table queries with the 2-level `categories` hierarchy (depth=0 = main, depth=1 = sub). Four frontend files need changes; no database changes.

## Files to Modify

### 1. `src/components/layout/MegaMenu.tsx` (main change)

**`useNavData` hook** — Replace `product_groups` query with main categories (depth=0):
```typescript
// REMOVE: supabase.from("product_groups")...
// REPLACE with:
const { data: mainCategories = [] } = useQuery({
  queryKey: ["main-categories-nav"],
  queryFn: async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, product_count")
      .eq("depth", 0).eq("is_active", true)
      .order("name");
    return data || [];
  },
  staleTime: 5 * 60 * 1000,
});
```
Keep the sub-categories query (already fetches all categories). Return `{ mainCategories, subCategories }` instead of `{ groups, categories }`.

**`MegaMenuDropdown`** — Receive a main category instead of a `ProductGroup`. Filter sub-categories by `parent_id === mainCategory.id` instead of `group_id === group.id`. Remove `buildCategoryTree` grouping by `group_id`. Sub-categories are flat (depth=1), so just list them directly.

**`DesktopMegaNav`** — Iterate over `mainCategories` instead of `groups`. Each main category gets a hover dropdown showing its sub-categories.

**`MobileMegaNav`** — Same: iterate `mainCategories`, accordion children are sub-categories filtered by `parent_id`.

Remove `ProductGroup` interface entirely. Remove `group_id` from Category interface.

### 2. `src/pages/AllCategoriesPage.tsx`

Remove `product_groups` query. Fetch categories with depth=0 as section headers, depth=1 as children under each (by `parent_id`). Remove `ungrouped` logic. Each main category section shows its sub-categories with product counts.

### 3. `src/pages/CategoryPage.tsx`

Remove the `groupData` query (lines 39-51) that fetches from `product_groups`. For breadcrumbs, if the category has a `parent_id`, fetch the parent category name/slug directly (this query already exists at line 54). Remove `group_id` from the category select. Breadcrumbs become: `Home > Parent Category > Current Category`.

### 4. `src/components/home/FeaturedCategories.tsx`

Add `.eq("depth", 0)` to the query so it only shows the 10 main categories, not sub-categories. Change limit from 8 to 10.

### 5. `src/App.tsx` — No changes needed
Current `/category/:slug` route already handles both main and sub-categories via `CategoryPage.tsx`.

## No Database Changes
The category hierarchy already exists. This is purely frontend.

## What is NOT changed
- `supabase/functions/import-products/index.ts` — Import function still references `product_groups` for backward compat. Can be cleaned up separately.
- `src/integrations/supabase/types.ts` — Auto-generated, never manually edited.


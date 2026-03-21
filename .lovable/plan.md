

# E-Mall: Navigation + Homepage Redesign

## Overview
Major redesign of the navigation bar and homepage. Navigation gets hover mega-menus with top brands per category, all 10 categories visible, no hamburger on desktop. Homepage gets reordered with new compact category icons and top brands showcase. Mobile gets a full-screen category overlay.

## Task Breakdown (ordered for implementation)

### Task 1: Rewrite `src/components/layout/MegaMenu.tsx`

**Desktop nav changes:**
- Remove `NAV_LIMIT = 8`, show all 10 categories directly (sorted by product_count DESC)
- Remove `AllCategoriesOverlay` component entirely
- Remove `MoreDropdown` component entirely
- Remove "All Categories" hamburger button from `DesktopMegaNav`
- Add "Brands" as a standalone nav item (links to `/brands`, no dropdown) between last category and Flash Deals

**New query in `useNavData`** — top 3 brands per main category:
```typescript
const { data: brandCategoryMap = [] } = useQuery({
  queryKey: ["brand-category-nav"],
  queryFn: async () => {
    const { data } = await supabase.rpc('get_brand_category_counts'); // or raw query
    // Fallback: fetch top brands per category via products join
    return data || [];
  },
  staleTime: 5 * 60 * 1000,
});
```
Since we can't do complex SQL joins easily from the client, simpler approach: fetch top 30 brands by product_count, and for the mega-menu dropdown, just show them as "Popular Brands" rather than per-category. This avoids the complex brand-category mapping query in the nav (that query is already on AllBrandsPage).

**Updated `MegaMenuDropdown`** — add right column with top brands:
- Left: sub-categories with product counts (existing)
- Right: "Popular Brands" — top 3-4 brands overall + "View All Brands →" link
- Add enter/exit CSS transition (opacity + translateY, 200ms)

**Add "Brands" nav item** between categories and Flash Deals spacer.

**Mobile nav (`MobileMegaNav`)** — restructure:
- Flash Deals and Brands buttons move to TOP (before categories)
- Add product counts next to each main category
- Sort categories by product_count DESC
- Remove "All Categories →" link (redundant)

### Task 2: Modify `src/components/layout/MobileBottomNav.tsx`

Change "Categories" from `<Link to="/categories">` to a button that opens a full-screen overlay:
- Add `useState` for overlay open/close
- Render overlay directly in MobileBottomNav (local state, simplest approach)
- Overlay: fixed inset-0, white bg, z-[60] (above bottom nav z-50)
- Header: "✕ Browse Categories" with close button
- Content: reuse `MobileMegaNav` component with `onClose` prop
- Close on navigate (onClose passed to MobileMegaNav)

### Task 3: Create `src/components/home/CategoryQuickNav.tsx`

Compact 2×5 icon grid of all 10 main categories:
- Query: categories depth=0, is_active=true, ordered by product_count DESC
- Lucide icon mapping by category name
- Each cell: icon + shortened name + link to `/category/{slug}`
- Grid: `grid grid-cols-5 gap-2` with `aspect-square`-ish cells
- Sizing: 64×64 desktop, smaller on mobile
- White card bg, subtle border, hover shadow

Icon mapping:
```
Tableware → UtensilsCrossed
Spare Parts → Settings  
Kitchen Utensils → ChefHat
Housekeeping Supplies → SprayCan
Bedroom Supplies → Bed
F & B Solutions → Wine
Kitchen Services → CookingPot (or Wrench)
Food Services → Coffee
Buffet & Banquet → ConciergeBell
Laundry Solutions → Shirt
```

### Task 4: Create `src/components/home/TopBrandsShowcase.tsx`

Horizontal scroll of top brands:
- Query: brands where is_active=true, product_count > 0, order by product_count DESC, limit 12
- Fallback: if fewer than 6 `is_featured`, fill from top by product_count
- Each card: logo or navy circle with initial letter + brand name + product count
- Link to `/brand/{slug}`
- "View All Brands →" header link
- `staleTime: 5 * 60 * 1000`

### Task 5: Modify `src/components/home/HeroBannerCarousel.tsx`

- Reduce height: `h-[160px] md:h-[250px]` (from 200/400)
- Add `rounded-lg` and container wrapper with padding
- Filter banners: only show those with non-empty `image_url` (already returns null if empty array)
- Add image error handling: `onError` to hide broken images

### Task 6: Update `src/pages/Index.tsx`

New section order:
```
CategoryQuickNav (NEW)
HeroBannerCarousel (reduced height)
FlashDealsRow (existing)
BestSellers (existing)
TopBrandsShowcase (NEW)
NewArrivals (existing)
TrustBadgeBar (existing)
QuotationCTA (existing)
```

Remove: HeroSection, FeaturedCategories, ShopByBusinessType, PromotionsStrip, ClientLogos, BrandCarousel

## Files Summary

| File | Action |
|------|--------|
| `src/components/layout/MegaMenu.tsx` | Major rewrite — remove hamburger/More/overlay, show all 10 cats, add Brands nav item, add brands to dropdown |
| `src/components/layout/MobileBottomNav.tsx` | Add overlay trigger + full-screen category overlay |
| `src/components/home/CategoryQuickNav.tsx` | NEW — compact 2×5 icon grid |
| `src/components/home/TopBrandsShowcase.tsx` | NEW — top brands horizontal scroll |
| `src/components/home/HeroBannerCarousel.tsx` | Reduce height, add rounded corners, image error handling |
| `src/pages/Index.tsx` | Reorder sections, remove 5 components, add 2 new ones |

## No database changes needed


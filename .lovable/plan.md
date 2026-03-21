

# Product Detail Redesign — Specs Layout + Bulk Pricing + Care Tips

## Current State
The page already has a solid 3-column layout (Image | Specs | Price Card) with bulk pricing tiers, flash deals, promotions, reviews, and tabs all working. The request asks for three specific improvements.

## What Already Exists vs What's Needed

| Feature | Status | Action |
|---------|--------|--------|
| Quick Specs (2-col grid) | ❌ Currently a full single-column table in col 2 (lines 448-466) | Redesign to compact 2-col grid |
| Bulk Pricing | ✅ Already exists in price card (lines 576-611) with interactive tier buttons | Minor: add "Volume discounts available" fallback when no tiers exist |
| Care Tips | ❌ No query or display | Add query + display section |
| Full Specs in tab | ✅ Already exists (lines 738-762) | No change needed |

## Changes to `src/pages/ProductDetail.tsx`

### 1. Redesign Key Specs section (lines 448-466) — Compact 2-col grid

Replace the full-height bordered table with a compact grid:
- 2-column CSS grid (`grid grid-cols-2 gap-x-6 gap-y-1.5`)
- Each cell: label in muted text, value in semibold, on same line
- Limit to first 8 specs max
- Subtle background card with rounded corners, no heavy header bar
- On mobile: add "See All Specs →" link that activates the Specifications tab

### 2. Add care tips query (new useQuery after related products query ~line 165)

```typescript
const { data: careTips } = useQuery({
  queryKey: ["care-tips", product?.category_id],
  queryFn: async () => {
    const { data: subCat } = await supabase
      .from("categories")
      .select("id, parent_id, depth")
      .eq("id", product!.category_id!)
      .single();
    const mainCatId = subCat?.depth === 0 ? subCat.id : subCat?.parent_id;
    if (!mainCatId) return [];
    const { data } = await supabase
      .from("category_care_tips")
      .select("id, title, tip_text, icon, sort_order")
      .eq("category_id", mainCatId)
      .eq("is_active", true)
      .order("sort_order");
    return data || [];
  },
  enabled: !!product?.category_id,
});
```

### 3. Add "Volume discounts available" fallback (after bulk pricing tiers ~line 611)

When `pricingTiers` is empty or null, show a subtle prompt:
```
🏷️ Volume discounts available — Request Bulk Quote
```

### 4. Add Care Tips + Related Products section (lines 891-918)

Replace the current single-row related products with a 2-column layout on desktop:
- Left (2/3): Related Products (existing horizontal scroll)
- Right (1/3): Care Tips card (blue-50 background, list of tips with check icons)
- Mobile: Care Tips full-width card above Related Products

### 5. Mobile "See All Specs" link

Below the compact specs grid, add a button visible only on mobile (`lg:hidden`) that sets `activeTab` to "specifications" and scrolls to the tabs section.

## No new files created
All changes stay in `ProductDetail.tsx` to avoid unnecessary abstraction for what amounts to ~60 lines of UI changes.

## No database changes needed
Both `pricing_tiers` and `category_care_tips` tables exist with proper RLS policies.


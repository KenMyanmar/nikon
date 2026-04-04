

# Product Card Consistency & Image Placeholder Fix

## Summary
Standardize product card vertical rhythm, replace the broken brand-initial fallback with a premium placeholder using brand logos from `products_public.brand_logo`, filter imageless products from homepage featured sections, and sort images-first in listings.

## Changes

### 1. `src/components/ProductCard.tsx` — Redesign card structure

**Add `brandLogo` prop** to the interface (optional `string | null`).

**Premium placeholder** (lines 89-93): Replace the brand-initial fallback with:
- Same `aspect-square` frame
- Background `#F8F9FA`, border `1px dashed #DEE2E6`
- Center the **brand logo** (`brandLogo` prop → `<img>` at ~40% size) if available
- If no brand logo, show IKON logo (`/lovable-uploads/...` or a small SVG) at reduced opacity
- Below: "Image Coming Soon" in `text-[#ADB5BD] text-xs`

**Fixed vertical rhythm** in the content area (lines 154-207):
- Brand name: add `min-h-[20px]` (line 155)
- Title: add `min-h-[48px]` to the existing `line-clamp-2` heading (line 156)
- Specs: **always render** the element even when `specs` is falsy, with `min-h-[24px]` and `line-clamp-1` (line 157 — change conditional to always-rendered with empty fallback)
- Footer (price + button): already uses `mt-auto` — no change needed

**Image frame**: Add `bg-[#F8F9FA]` and ensure `rounded-lg` on the image container (line 88).

### 2. `src/components/home/BestSellers.tsx` — Filter imageless products

Add to query (after line 16 `.eq("is_featured", true)`):
```
.not("thumbnail_url", "is", null)
.neq("thumbnail_url", "")
```

Increase `.limit(12)` to `.limit(16)` to compensate for any filtered-out products, ensuring the row still shows ~12 cards.

### 3. `src/components/home/NewArrivals.tsx` — Filter imageless products

Same two filters added to the query (after line 15 `.eq("is_active", true)`):
```
.not("thumbnail_url", "is", null)
.neq("thumbnail_url", "")
```

Increase `.limit(12)` to `.limit(16)`.

### 4. `src/pages/CategoryPage.tsx` — Images-first sort

In the `filtered` useMemo (lines 130-147), after existing sort logic (line 144), add a stable secondary sort that pushes imageless products to the end:

```ts
result.sort((a, b) => {
  const aHas = a.thumbnail_url ? 0 : 1;
  const bHas = b.thumbnail_url ? 0 : 1;
  if (aHas !== bHas) return aHas - bHas;
  // preserve existing sort order for ties
  return 0;
});
```

This must run **after** the primary sort so it only breaks ties.

Also update the three query `.select()` calls (lines 85, 96, 106) to include `brand_logo` so the ProductCard can receive it.

### 5. `src/pages/SearchResults.tsx` — Images-first sort

In the `filtered` useMemo (lines 43-54), add the same images-first stable sort after filtering.

### 6. All callers of `<ProductCard>` — Pass `brandLogo` prop

Update ProductCard invocations in:
- `BestSellers.tsx` — add `brand_logo` to select, pass as `brandLogo={p.brand_logo}`
- `NewArrivals.tsx` — same
- `CategoryPage.tsx` — same (already adding to select in step 4)
- `SearchResults.tsx` — check if `search_products` RPC returns `brand_logo`; if not, the placeholder falls back to IKON logo (acceptable)

## Key data point
`products_public` view already has a `brand_logo` column (confirmed in types.ts line 2706), so no joins or DB changes are needed — just add it to `.select()` strings.

## No database changes required
All changes are frontend-only. Six files modified.


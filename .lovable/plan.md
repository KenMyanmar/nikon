

# Fix: Promotions Not Visible + MMT Timezone Handling

## Findings

1. **`PromotionsStrip.tsx` exists** but is NOT rendered anywhere — not in `Index.tsx`, not in `MainLayout.tsx`.
2. **`usePromotions()` hook** queries promotions with `is_active = true` but does NOT filter by `start_date`/`end_date` — expired promotions would show.
3. **DB has 2 promotions**: one expired (ended Mar 25), one active (Wine Promotion, ends Apr 30). The Wine Promotion should be visible now.
4. **Flash deals query** also lacks date filtering.
5. **No MMT timezone utility exists** — all dates display in browser locale.

## Changes

### 1. NEW: `src/utils/timezone.ts` — MMT utility
- `formatToMMT(isoDate, format)` — converts UTC to MMT (UTC+6:30) for display
- `isActiveNow(startDate, endDate)` — checks if a date range is currently active
- `getRelativeTime(date)` — "2d 5h left" style countdown

### 2. UPDATE: `src/hooks/useMarketingData.ts` — Add date filters
- `usePromotions()`: add `.lte('start_date', now).gte('end_date', now)` to the query
- `useFlashDeals()`: add `.lte('start_time', now).gte('end_time', now)` to the query

### 3. NEW: `src/components/home/PromotionsBanner.tsx` — Homepage banner section
- Query active promotions (reuses `usePromotions` hook which now has date filters)
- Single promotion → full-width banner card; multiple → horizontal carousel
- Banner design: image background with gradient overlay, title, discount badge, "Ends {date in MMT}", "Shop Now →" button
- Links: product → `/product/{slug}`, category → `/category/{slug}`, all → `/categories`
- Returns `null` if no active promotions

### 4. UPDATE: `src/pages/Index.tsx` — Add promotions banner
```
HeroBannerCarousel → PromotionsBanner (NEW) → CategoryQuickNav → ...
```

### 5. NEW: `src/pages/Promotions.tsx` — All promotions listing page
- Grid layout (`grid-cols-1 md:grid-cols-2`) showing all active promotions as cards
- Each card: banner image, title, description, discount info, end date in MMT
- Click navigates to target products

### 6. NEW: `src/pages/PromotionDetail.tsx` — Single promotion + products
- Header: banner image, title, description, end date in MMT
- Body: product grid of targeted products (fetched by `target_ids`)

### 7. UPDATE: `src/App.tsx` — Add routes
- `/promotions` → `Promotions.tsx`
- `/promotions/:id` → `PromotionDetail.tsx`

### 8. UPDATE: `src/components/layout/Header.tsx` — Add nav link
- Add "Promotions" link in the announcement bar or desktop nav
- Show red dot badge if active promotions exist

### 9. UPDATE: `src/components/home/FlashDealsRow.tsx` — Date filter + MMT
- Add `.lte('start_time', now).gte('end_time', now)` to the flash deals query
- Use `formatToMMT` for any date display

### 10. Existing `PromotionsStrip.tsx` — Keep as-is
- It's a thin announcement strip (not a banner). Can optionally be added to `MainLayout` header area later, but the new `PromotionsBanner` is the primary feature.

## Files
| File | Action |
|------|--------|
| `src/utils/timezone.ts` | NEW |
| `src/components/home/PromotionsBanner.tsx` | NEW |
| `src/pages/Promotions.tsx` | NEW |
| `src/pages/PromotionDetail.tsx` | NEW |
| `src/hooks/useMarketingData.ts` | UPDATE — add date filters |
| `src/pages/Index.tsx` | UPDATE — add PromotionsBanner |
| `src/App.tsx` | UPDATE — add 2 routes |
| `src/components/layout/Header.tsx` | UPDATE — add Promotions nav link |
| `src/components/home/FlashDealsRow.tsx` | UPDATE — add date filter |

No database changes required. All `timestamptz` columns handle timezone comparison correctly with ISO strings.




# E-Mall Marketing Integration — All 4 Prompts

## Overview
Add marketing sections (banners, flash deals, promotions, coupons) to the customer-facing E-Mall. All data comes from existing Supabase tables with public read RLS already in place. No migrations needed.

## MKT-1: Homepage Marketing Sections

### 1a. Hero Banner Carousel (`src/components/home/HeroBannerCarousel.tsx`) — NEW
- Query `banners` where `is_active = true AND position = 'hero'` ordered by `sort_order`
- Full-width image carousel using `embla-carousel-react` (already installed)
- Auto-play 5s interval, dot indicators, fade/slide transition
- Each banner: background image, title overlay, subtitle, clickable link
- If no banners, render nothing (return null)
- Place above or replacing the existing HeroSection in Index.tsx

### 1b. Flash Deals Row (`src/components/home/FlashDealsRow.tsx`) — NEW
- Query `flash_deals` joined with `products` (active, within dates, stock remaining), limit 8
- Horizontal scrollable card row with section header "⚡ Flash Deals"
- Countdown timer to earliest deal end time
- Each card: thumbnail, product name, original price strikethrough, flash price red, discount badge, stock progress bar, "Add to Cart"
- "Almost Gone!" label when >70% sold
- Hide section if no deals
- "View All Deals →" link to `/flash-deals`

### 1c. Promotions Strip (`src/components/home/PromotionsStrip.tsx`) — NEW
- Query `promotions` (active, within dates), limit 3, order by priority
- Thin banner strip auto-rotating every 4s
- Shows promotion title + discount description
- Hide if no promotions

### 1d. Update `src/pages/Index.tsx`
- Add `HeroBannerCarousel` above HeroSection (banners show above hero, or replace hero if banners exist)
- Add `FlashDealsRow` after FeaturedCategories
- Add `PromotionsStrip` after BestSellers

## MKT-2: Flash Deals Page

### `src/pages/FlashDealsPage.tsx` — NEW
- Route: `/flash-deals`
- Hero: gradient banner (orange→red), "⚡ Flash Deals" heading, master countdown
- Grid of all active deals (2/3/4 cols responsive)
- Each card: image, discount badge, prices, stock bar (green/orange/red), per-deal countdown, Add to Cart, "SOLD OUT" overlay
- Empty state: friendly message + "Browse all products" link

### Navigation updates
- Add "Flash Deals" link with ⚡ icon to Header nav area (already has "🔥 Deals" link pointing to `/deals` — change to `/flash-deals`)
- Add route to `App.tsx`

## MKT-3: Coupon Code at Cart/Checkout

### Update `src/pages/CartPage.tsx`
- Add collapsible "Have a promo code?" section in the Order Summary sidebar
- Input field + "Apply" button
- Validation: query `coupons` by code, check active/dates/usage limits
- Apply discount types: percentage, fixed_amount, free_shipping
- Check min_order_amount
- Show green success banner with discount line in order summary
- Allow removing applied coupon
- Store in local state (applied coupon resets on page leave)

## MKT-4: Product Promotion Badges

### Create `src/hooks/useMarketingData.ts` — NEW
- Single hook fetching all active flash deals + promotions once
- React Query with 60s stale time
- Provides `getFlashDeal(productId)` and `getPromotion(productId, categoryId, brandId)` helpers

### Update `src/components/ProductCard.tsx`
- Use `useMarketingData` to check for flash deal or promotion on each product
- If flash deal: show original price strikethrough + flash price + "⚡ Flash Deal" tag
- If promotion: show promotion badge (e.g., "20% OFF")

### Update `src/pages/ProductDetail.tsx`
- Flash deal banner above price with countdown + stock bar
- Promotion info card below price section

## Files Summary

| File | Action |
|------|--------|
| `src/components/home/HeroBannerCarousel.tsx` | Create |
| `src/components/home/FlashDealsRow.tsx` | Create |
| `src/components/home/PromotionsStrip.tsx` | Create |
| `src/pages/FlashDealsPage.tsx` | Create |
| `src/hooks/useMarketingData.ts` | Create |
| `src/pages/Index.tsx` | Add marketing sections |
| `src/pages/CartPage.tsx` | Add coupon input |
| `src/components/ProductCard.tsx` | Add deal/promo badges |
| `src/pages/ProductDetail.tsx` | Add deal/promo display |
| `src/App.tsx` | Add `/flash-deals` route |
| `src/components/layout/MegaMenu.tsx` | Change `/deals` → `/flash-deals` |
| `src/components/layout/Header.tsx` | Change `/deals` → `/flash-deals` |

## Implementation Order
1. `useMarketingData` hook (shared dependency)
2. Homepage components (BannerCarousel, FlashDealsRow, PromotionsStrip) + Index.tsx
3. FlashDealsPage + routing
4. CartPage coupon input
5. ProductCard + ProductDetail badges
6. Navigation link fixes


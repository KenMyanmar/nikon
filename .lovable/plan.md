

# World-Class E-Mall UX Overhaul — Buying Urge & Decision Triggers

## Vision
Transform from a basic catalog into a premium B2B procurement platform that triggers buying urgency through social proof, scarcity signals, wholesale benefits, and professional trust indicators — inspired by the reference design.

## Changes Overview

### 1. Homepage Restructure (`src/pages/Index.tsx`)
Reorder and add new sections for maximum conversion flow:
```
HeroBannerCarousel → HeroSection → TrustBadgeBar (redesigned) →
FeaturedCategories → FlashDealsRow → BestSellers →
ShopByBusinessType (NEW) → PromotionsStrip →
ClientLogos (NEW) → BrandCarousel →
QuotationCTA → NewArrivals
```
Remove `IndustrySolutions` (replaced by `ShopByBusinessType`).

### 2. New: Shop by Business Type (`src/components/home/ShopByBusinessType.tsx`)
- 5 cards in a row: Café, Restaurant, Hotel, Bar & Pub, Bakery
- Each card: dark overlay image with white text label at bottom
- Clicking links to a filtered category/search page
- Uses placeholder gradient backgrounds (no uploaded images embedded)

### 3. New: Client Logos Section (`src/components/home/ClientLogos.tsx`)
- "Trusted by Leading Hotels & Restaurants" heading
- Row of client brand logos (Chatrium, YKKO, Novotel, etc.) — displayed as styled text badges since no logo files exist yet
- Adds massive social proof / trust

### 4. Redesign TrustBadgeBar (`src/components/home/TrustBadgeBar.tsx`)
- Horizontal icon badges: "Fast Delivery", "Wholesale Pricing", "160+ Trusted Brands", "B2B Accounts"
- Cleaner layout matching reference — icons + text inline, centered strip

### 5. ProductCard Enhancements (`src/components/ProductCard.tsx`)
- Add contextual badges: "Best Seller" (if `is_featured`), stock urgency ("Only 3 left!")
- Show "per piece" unit label next to price
- "Bulk Order" tag for products with MOQ > 1
- Stronger CTA: bigger "Add to Cart" with cart icon, orange/red gradient feel

### 6. Product Detail Page Overhaul (`src/pages/ProductDetail.tsx`)
- **Left column**: Product image + thumbnail strip below (from `product.images` array)
- **Middle column**: Brand, Category, key specs displayed as label:value rows with separator lines (matching reference)
- **Right column / sidebar**: Price box with "per piece" label, Bulk Pricing section (if MOQ > 1: show unit price tiers), "Add to Cart" button (orange), "Request Bulk Quote" button (navy outline), Stock status + "Ships in 1-2 Days"
- **Wholesale Benefits card** below price box: checkmarks for "Bulk Discounts", "Business Accounts", "Fast Delivery"
- **"Trusted by HoReCa Professionals"** mini brand logo strip

### 7. Header Cart Badge Fix (`src/components/layout/Header.tsx`)
- Only show cart count badge when count > 0

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Restructure section order, add new components |
| `src/components/home/ShopByBusinessType.tsx` | Create — 5 business type cards |
| `src/components/home/ClientLogos.tsx` | Create — trusted client logos strip |
| `src/components/home/TrustBadgeBar.tsx` | Redesign — icon badges strip |
| `src/components/ProductCard.tsx` | Add Best Seller badge, stock urgency, per-piece label |
| `src/pages/ProductDetail.tsx` | 3-column layout, bulk pricing, wholesale benefits, image thumbnails |
| `src/components/layout/Header.tsx` | Hide cart badge when count is 0 |

## Implementation Order
1. New homepage sections (ShopByBusinessType, ClientLogos)
2. TrustBadgeBar redesign
3. ProductCard enhancements
4. ProductDetail overhaul
5. Homepage restructure + Header fix


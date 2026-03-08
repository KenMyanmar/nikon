

# Color Theme Overhaul: Red → Golden Amber + Product Page Polish

## Overview
Transform the site-wide accent color from red to golden amber (navy + gold = premium B2B feel), restructure the ProductDetail page to a 3-column layout matching the reference, and add wholesale/trust sections. Flash deal and sale elements stay red using explicit colors.

## Changes

### 1. `src/index.css` — Color Token Update
- Change `--accent` from `357 86% 53%` (red) to `40 90% 50%` (golden amber)
- Change `--accent-foreground` from white to `222 47% 11%` (dark navy — readable on gold)
- Add new custom token `--ikon-sale: 357 86% 53%` to preserve red for sale/flash deal badges
- Keep `--ikon-red` tokens as-is for explicit red usage

### 2. `src/pages/ProductDetail.tsx` — Major Restructure

**Layout: 2-col → 3-col** (matching reference image):
- **Col 1 (span-5)**: Image gallery with zoom (unchanged)
- **Col 2 (span-4)**: Key specs table — Brand, Category, Material, SKU, Unit etc. displayed as clean label:value pairs in a bordered card
- **Col 3 (span-3)**: Price card — bordered card containing bulk pricing tiers with green checkmarks, price display, quantity selector, full-width golden "Add to Cart" CTA, navy outline "Request Quote" button

**Add "Wholesale Benefits" banner** below the 3-column area:
- Full-width dark navy background
- White text with checkmark items: "Bulk Discounts", "Business Accounts", "Fast Delivery"

**Flash deal elements**: Replace `text-accent`/`bg-accent` with explicit `text-red-600`/`bg-red-600` so they stay red and stand out against the golden buttons

### 3. `src/components/ProductCard.tsx` — Flash Deal Color Fix
- Flash deal badge: change from `bg-accent text-accent-foreground` to `bg-red-600 text-white`
- Flash deal inline tag: change from `text-accent bg-accent/10` to `text-red-600 bg-red-50`
- Price and "Add to Cart" button keep `accent` (now golden) — this is correct
- Discount percentage badge: explicit red

### 4. `src/components/home/FlashDealsRow.tsx` — Flash Deal Color Fix
- Discount badges and flash-specific highlights: explicit `bg-red-600 text-white` instead of accent

### 5. `src/pages/FlashDealsPage.tsx` — Flash Deal Color Fix
- Discount badge, progress bar urgent state: explicit red classes

### 6. `src/components/layout/MegaMenu.tsx` — Flash Deals Link Color
- The "⚡ Flash Deals" link currently uses `bg-accent` — change to explicit `bg-red-600 text-white` so flash deals stay visually urgent

### 7. `src/components/home/QuotationCTA.tsx` — CTA Button
- Currently uses `bg-accent hover:bg-ikon-red-dark` — keep `bg-accent` (now golden), change hover to `hover:bg-accent/90`

### 8. `src/components/SearchAutocomplete.tsx` — Search Button
- Currently uses `bg-accent hover:bg-ikon-red-dark` — change hover to `hover:bg-accent/90`

### Files Changed Summary
| File | Change |
|------|--------|
| `src/index.css` | Accent red→gold, add `--ikon-sale` token |
| `src/pages/ProductDetail.tsx` | 3-col layout, specs column, price card, wholesale banner, flash deal colors to explicit red |
| `src/components/ProductCard.tsx` | Flash deal badges → explicit red |
| `src/components/home/FlashDealsRow.tsx` | Flash deal badges → explicit red |
| `src/pages/FlashDealsPage.tsx` | Flash deal badges → explicit red |
| `src/components/layout/MegaMenu.tsx` | Flash Deals link → explicit red |
| `src/components/home/QuotationCTA.tsx` | Fix hover color reference |
| `src/components/SearchAutocomplete.tsx` | Fix hover color reference |


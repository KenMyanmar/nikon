# E-Mall: Top Nav & Category Consistency Fix

Pure frontend cleanup — four files, no DB changes.

## 1. `src/components/layout/MegaMenu.tsx`
- `useNavData` → `mainCategories` query (line 56): change `.order("product_count", { ascending: false })` to `.order("name", { ascending: true })`.
- `useNavData` → `subCategories` query (line 71): same change — sort by `name` ASC.
- Leave `topBrands` query untouched (still ordered by `product_count`).

## 2. `src/components/home/CategoryQuickNav.tsx`
Use the dynamic approach (Option B) so counts never go stale.

- Fix the two broken slugs in `categoryConfig`:
  - `FBS.slug`: `"f-b-solutions"` → `"f-and-b-solutions"`
  - `BQE.slug`: `"buffet-banquet"` → `"buffet-and-banquet"`
- Remove the hardcoded `count` field from `categoryConfig` (or keep as fallback) and add a second query against `categories` where `depth = 0` and `is_active = true`, selecting `name, slug, product_count`.
- Build cards by joining `product_groups.code → categoryConfig` (color, icon, name, slug) and matching the parent category's `product_count` by name. Display the live count.
- Add `.sort((a, b) => a.config.name.localeCompare(b.config.name))` to the cards array so the order matches the nav bar.
- Keep skeleton loading until both queries resolve.

## 3. `src/components/layout/Footer.tsx`
- `footer-categories` query (line 133): change `.order("product_count", { ascending: false })` to `.order("name", { ascending: true })`.
- No change to the duplicated `SHORT_NAMES` map — already in sync with MegaMenu.

## 4. `src/pages/Index.tsx`
Reorder the homepage so promotions land directly under the hero:

```text
HeroBannerCarousel
PromotionsBanner      ← moved up
CategoryQuickNav
FlashDealsRow
BestSellers
TopBrandsShowcase
ClientLogos
NewArrivals
TrustBadgeBar
QuotationCTA
HoReCaResources
```

## Verification After Deploy
- Desktop nav bar order: Bedroom Supplies | Buffet & Banquet | F&B … | Food Svc | Housekeeping | Kitchen Svc | Utensils | Laundry | Spare Parts | Tableware.
- Clicking F&B Solutions and Buffet & Banquet cards on the homepage navigates to the correct category page (no 404).
- MegaMenu hover dropdowns show sub-categories alphabetically (e.g. Buffet & Banquet shows F & B Linen).
- Footer "Shop by Category" matches the nav order.
- `PromotionsBanner` renders directly under the hero carousel.
- Homepage category cards display fresh counts pulled from the DB.

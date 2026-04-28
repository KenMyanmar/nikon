# Fix: "View All" on Best Sellers leads to a blank page

Currently, the "View All" link on the Best Selling Products section points to `/search?q=` (empty query), which renders the SearchResults page with no query and shows nothing. We'll create a dedicated Best Sellers page instead.

## Changes

### 1. New page: `src/pages/BestSellersPage.tsx`
A full grid page modeled on `CategoryPage.tsx`:
- Uses `MainLayout`, `Breadcrumbs` (Home > Best Sellers), `FilterSidebar`, `ProductGrid`.
- Query (React Query, key `["best-sellers-page"]`):
  - `products_public` select the same columns CategoryPage uses.
  - Filters: `is_active = true`, `is_featured = true`, `thumbnail_url not null & not ''`.
  - Order: `onhand_qty desc`, limit 200.
- Local state: `sort` (newest / price asc / price desc), `selectedBrands`, `stockFilters`, `priceRange`.
- Derived: brand list, max price, filtered + sorted products (images-first secondary sort, same as CategoryPage).
- Heading: "Best Selling Products" + sort dropdown.
- Loading skeletons and empty state mirror CategoryPage.

### 2. Update `src/components/home/BestSellers.tsx`
- Change the "View All" `<Link to="/search?q=">` to `<Link to="/best-sellers">`.

### 3. Register route in `src/App.tsx`
- Import `BestSellersPage`.
- Add `<Route path="/best-sellers" element={<BestSellersPage />} />` above the catch-all `*` route (e.g. next to `/flash-deals`).

## Acceptance
- Clicking "View All" on the homepage Best Sellers section opens `/best-sellers` with a fully populated, filterable grid (brand, availability, price range, sort) — never a blank screen.

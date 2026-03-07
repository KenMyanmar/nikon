

# Connect Frontend to Real Supabase Data

This is a large feature covering 9 sub-tasks. Here is the implementation plan.

## Overview

Replace all hardcoded/mock data with live Supabase queries using `@tanstack/react-query`. Create 3 new pages (Search, Category, Product Detail). Add search autocomplete to HeroSection and Header.

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/SearchResults.tsx` | `/search?q=` page with product grid, filters (brand, price, stock status) |
| `src/pages/CategoryPage.tsx` | `/category/:slug` page with filtered product grid, sort options |
| `src/pages/ProductDetail.tsx` | `/product/:slug` full product detail page |
| `src/components/SearchAutocomplete.tsx` | Shared debounced search dropdown (used in HeroSection + Header) |
| `src/components/ProductGrid.tsx` | Reusable product grid layout |
| `src/components/FilterSidebar.tsx` | Reusable filter sidebar (brand, price range, stock status) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes: `/search`, `/category/:slug`, `/product/:slug` |
| `src/components/ProductCard.tsx` | Accept `slug` prop, wrap in `Link to="/product/{slug}"`, keep existing styling logic (already correct for price/stock) |
| `src/components/home/FeaturedCategories.tsx` | Replace hardcoded array with `useQuery` on `categories` table (is_active, sort_order, limit 8) |
| `src/components/home/BestSellers.tsx` | Replace mock data with `useQuery` on `products_public` view (is_featured + is_active, order by onhand_qty desc, limit 12) |
| `src/components/home/NewArrivals.tsx` | Same as BestSellers but order by `created_at desc` |
| `src/components/home/BrandCarousel.tsx` | Replace hardcoded array with `useQuery` on `brands` (is_featured + is_active), show logo_url, link to `/brand/{slug}` |
| `src/components/home/HeroSection.tsx` | Integrate `SearchAutocomplete`, navigate to `/search?q=` on Enter |
| `src/components/layout/Header.tsx` | Integrate `SearchAutocomplete` in desktop + mobile search bars |

## Key Technical Details

### Data Fetching Pattern
All queries use `@tanstack/react-query` with the Supabase client:
```typescript
const { data } = useQuery({
  queryKey: ['featured-categories'],
  queryFn: async () => {
    const { data } = await supabase
      .from('categories')
      .select('name, slug, product_count, image_url')
      .eq('is_active', true)
      .order('sort_order')
      .limit(8);
    return data;
  }
});
```

### SearchAutocomplete Component
- Debounce input by 300ms using a simple `useEffect` + `setTimeout` pattern
- Call `search_products` RPC via `supabase.rpc('search_products', { search_term, result_limit: 5 })`
- Show dropdown with product results (image, title, brand, price), plus category/brand text matches
- On Enter or click Search button: `navigate('/search?q=' + encodeURIComponent(query))`

### ProductCard Updates
- Add `slug` prop, wrap card in `<Link to={'/product/' + slug}>`
- Existing price/stock logic is already correct (navy "Request Quote" for null, red price for value, stock badges)

### Search Results Page (`/search?q=`)
- Read `q` from URL search params
- Call `search_products` RPC with the query
- Display results in a grid with `FilterSidebar` (brand checkboxes from results, price range slider, stock status toggles)
- Header: "X results for 'query'"

### Category Page (`/category/:slug`)
- Query `products_public` view filtered by `category_slug = slug`
- Sort dropdown: Newest, Price Low-High, Price High-Low
- `FilterSidebar` with brand filter from category's products
- Pagination or infinite scroll (start with limit 50)

### Product Detail Page (`/product/:slug`)
- Query `products_public` where `slug` matches
- Display: placeholder image area, description as title, brand_name, stock_code as SKU, stock status badge
- Price section: selling_price formatted as "MMK X,XXX,XXX" or "Request Quote" button (navy outline)
- Quantity selector + Add to Cart (red) + Request Quote (navy outline) buttons
- Specifications from `specifications` JSONB rendered as key-value table
- Related products carousel: query same category, limit 6, exclude current product

### No Database Changes Required
All data already exists in the right schema. The `products_public` view and `search_products` RPC provide everything needed.


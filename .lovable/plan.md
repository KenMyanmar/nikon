

# Fix Product Card Sizing on Brand Page

## Root Cause
The `flex-1` content container (line 181 of `BrandPage.tsx`) lacks `min-w-0`, which can cause flex items to not shrink properly. Combined with the grid having only `grid-cols-2` at smaller breakpoints and `aspect-square` images, cards appear oversized.

## Fix — Two files

### 1. `src/pages/BrandPage.tsx` (line 181)
Add `min-w-0` to the flex-1 container to ensure proper flex shrinking:
```
<div className="flex-1 min-w-0">
```

### 2. `src/components/ProductGrid.tsx` (line 24)
The grid jumps from 2 cols directly to 3 at `md`. Add an intermediate breakpoint and ensure tighter gaps:
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4
```
This ensures 3 columns kick in earlier (640px), preventing oversized 2-column cards when the viewport is between 640-768px.

Two small class changes, no logic changes.




# Add Loading Skeletons to CategoryQuickNav and TopBrandsShowcase

## Problem
Both components return `null` while data loads, causing invisible sections and layout jumps.

## Changes

### 1. `src/components/home/CategoryQuickNav.tsx`
- Destructure `isLoading` from `useQuery`
- Replace `if (categories.length === 0) return null` with: if `isLoading`, show 10 skeleton cells in the same 5-col grid (each cell: a rounded skeleton matching the icon+label size). If loaded and empty, still return `null`.

### 2. `src/components/home/TopBrandsShowcase.tsx`
- Destructure `isLoading` from `useQuery`
- Replace `if (brands.length === 0) return null` with: if `isLoading`, show header skeleton + 6 skeleton brand cards in the horizontal scroll row. If loaded and empty, still return `null`.

Both use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`. Two small edits, no new files.


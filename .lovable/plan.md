

# Fix: Auto Scroll to Top on Page Navigation

## Problem
No scroll reset on route changes — users land mid-page when navigating between pages.

## Changes

### 1. Create `src/components/ScrollToTop.tsx`
- Uses `useLocation().pathname` in a `useEffect` to call `window.scrollTo(0, 0)`
- Returns `null` (render-less component)

### 2. Modify `src/App.tsx`
- Import `ScrollToTop`
- Place `<ScrollToTop />` as first child inside `<BrowserRouter>`, before `<AuthProvider>`:

```
<BrowserRouter>
  <ScrollToTop />
  <AuthProvider>
    <Routes>...</Routes>
  </AuthProvider>
</BrowserRouter>
```

Two files, no database changes.


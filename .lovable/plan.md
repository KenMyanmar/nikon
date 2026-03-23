

# Improve Scroll-to-Top: Location Key + Product Detail Safety Net

## Changes

### 1. `src/components/ScrollToTop.tsx`
- Use `location.key` instead of `pathname` as the `useEffect` dependency — this ensures scroll resets even when navigating to the same pathname (e.g., related product clicks)
- Wrap `window.scrollTo(0, 0)` in `requestAnimationFrame` so the new page content renders before scrolling

```tsx
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.key]);
  return null;
};
```

### 2. `src/pages/ProductDetail.tsx`
- Add a `useEffect` keyed on `slug` that scrolls to top — catches the case where React reuses the ProductDetail component for related product navigation

```tsx
useEffect(() => {
  window.scrollTo(0, 0);
}, [slug]);
```

Insert after the existing `useEffect` block (around line 78-81). Two files, minimal changes.


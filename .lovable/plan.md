

# Fix: Make Cart Product Names and Images Clickable

## Problem
On `/cart`, product thumbnails and names are plain elements — not links to the product detail page.

## Fix — `src/pages/CartPage.tsx`

### 1. Wrap the image container (lines 262-270) in a Link
```tsx
<Link to={`/products/${product.id}`} className="w-20 h-20 rounded bg-muted/30 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
  {product.thumbnail_url ? (
    <img src={product.thumbnail_url} alt={product.description || ""} className="w-full h-full object-contain p-1" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-primary/10">
      <span className="text-2xl font-bold text-primary">{brandInitial}</span>
    </div>
  )}
</Link>
```

### 2. Change product name (line 275) from `<p>` to `<Link>`
```tsx
<Link to={`/products/${product.id}`} className="text-sm font-semibold text-foreground line-clamp-2 hover:text-[#F97316] hover:underline transition-colors">
  {product.description}
</Link>
```

Two element changes in one file. `Link` is already imported on line 2.


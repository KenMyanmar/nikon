

# Fix: Description Tab — Show Long Description + Features

## Change: `src/pages/ProductDetail.tsx` (lines 567-573)

Replace the Description tab content block:

**Current** (lines 569-571):
```tsx
<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
  {product.short_description || product.description || "Detailed description coming soon..."}
</div>
```

**New**:
```tsx
<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
  {product.long_description || product.short_description || product.description}
</div>
{product.features && (
  <>
    <h3 className="text-base font-semibold text-foreground">Features</h3>
    <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
      {product.features.split(/\n|;/).filter((f: string) => f.trim()).map((feat: string, i: number) => (
        <li key={i}>{feat.trim()}</li>
      ))}
    </ul>
  </>
)}
```

The parent `div` already has `space-y-4`, so the heading and list will space naturally below the description text.

No other files affected. Features tab remains unchanged.


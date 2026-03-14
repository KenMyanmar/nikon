

# Clean Up Description Tab

## Change: `src/pages/ProductDetail.tsx` (lines 569-584)

Replace the Description tab content to:
1. Remove `product.long_description` from the fallback chain — show only `short_description` or `description`
2. Remove the features bullet list entirely (the Features tab handles it)

**Before** (lines 569-584):
```tsx
<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
  {product.long_description || product.short_description || product.description || "Detailed description coming soon..."}
</div>
{product.features && ( ... features bullet list ... )}
```

**After**:
```tsx
<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
  {product.short_description || product.description || "Detailed description coming soon. Contact us for more information about this product."}
</div>
```

Single line change — removes `long_description` reference and the entire features block from the Description tab.

## Database Cleanup

The user will run the SQL separately to clear `long_description` where it duplicates `features`. No migration needed from our side.


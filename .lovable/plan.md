

# Fix: Cart Query Key Invalidation

## Summary
Update the `onSuccess` handler in `useAddToCart` to invalidate all actual cart-related query keys, fixing the stale cart issue.

## Change — `src/hooks/useCart.ts`

Replace the `onSuccess` callback (lines 61-64) from:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["cart-count"] });
  queryClient.invalidateQueries({ queryKey: ["cart-items"] });
},
```

To:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["cart-count"] });
  queryClient.invalidateQueries({ queryKey: ["cart"] });
  queryClient.invalidateQueries({ queryKey: ["cart-checkout"] });
  queryClient.invalidateQueries({ queryKey: ["cart-for-quote"] });
  queryClient.invalidateQueries({ queryKey: ["recommendations"] });
},
```

Single file, single block change.


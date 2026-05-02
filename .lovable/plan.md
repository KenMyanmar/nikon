## Cart Orphan Bug — Remaining Fix (Part 3 only)

### Status of the prompt

On inspecting `src/pages/CartPage.tsx`, **Parts 1 and 2 are already implemented**:

- Validation `useMemo` blocks (lines 144–172) already skip orphans via `if (!item.product) return;`
- `orphanedItems` detection (lines 174–177), `handleRemoveUnavailable` handler (lines 179–184), and the amber "Remove unavailable" notice (lines 290–305) all exist
- `AlertTriangle` is already imported (line 9)

**Only Part 3 (cart count badge) remains outstanding.** Without it, the header cart badge stays inflated by orphan rows until the next refetch, even after the user clicks "Remove unavailable."

### Changes

**1. `src/hooks/useCart.ts` — make `useCartCount` exclude orphans**

Update the count query in `useCartCount` to use an `!inner` join against `products_public`, so deactivated products are filtered out at the DB level:

```ts
const { count } = await supabase
  .from("cart_items")
  .select("*, product:products_public!inner(id)", { count: "exact", head: true })
  .eq("customer_id", customerId);
return count || 0;
```

This matches how the cart page itself loads products (via `products_public`), so the badge count will always equal the number of items the user can actually see.

**2. `src/pages/CartPage.tsx` — invalidate `cart-count` after removing orphans**

In `handleRemoveUnavailable` (lines 179–184), after the removal loop, invalidate the cart-count query so the header badge refreshes immediately rather than waiting for the next refetch:

```ts
const handleRemoveUnavailable = async () => {
  for (const item of orphanedItems) {
    await removeItem.mutateAsync(item.id);
  }
  queryClient.invalidateQueries({ queryKey: ["cart-count"] });
  toast({ title: "Removed unavailable items", description: `${orphanedItems.length} item(s) removed from cart` });
};
```

`queryClient` is already in scope (line 23: `const queryClient = useQueryClient();`).

### Files changed
- `src/hooks/useCart.ts` — inner join in `useCartCount`
- `src/pages/CartPage.tsx` — invalidate `cart-count` in `handleRemoveUnavailable`

### Not changed
- No DB changes
- No changes to validation logic, orphan detection, notice UI, or `useAddToCart` (already invalidates `cart-count` correctly)

### Verification
1. With an orphaned cart item present, header badge count should match the visible item count (no inflation).
2. Click "Remove unavailable" → notice disappears, badge updates immediately without page refresh.
3. Refresh the page → still clean state, badge accurate, Checkout enabled.

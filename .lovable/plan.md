

# Fix: Block Checkout When Cart Has Unpriced Items

## Summary
Add detection for unpriced items (`selling_price = NULL` or `0`) in the checkout flow. Show a warning banner, adjust the subtotal to only count priced items, and disable payment when all items are unpriced.

## Changes — `src/pages/Checkout.tsx`

### 1. Add `unpricedItems` and `pricedItems` derivations (after line 143)

```typescript
const unpricedItems = useMemo(() => cartItems.filter(
  (i) => !i.product?.selling_price || Number(i.product.selling_price) === 0
), [cartItems]);

const pricedItems = useMemo(() => cartItems.filter(
  (i) => i.product?.selling_price && Number(i.product.selling_price) > 0
), [cartItems]);

const hasUnpricedItems = unpricedItems.length > 0;
const allUnpriced = pricedItems.length === 0 && cartItems.length > 0;
```

### 2. Update `subtotal` calculation (line 140-143)

Change to only sum priced items, matching what the server does:

```typescript
const subtotal = useMemo(() => pricedItems.reduce((s, i) => {
  const { price } = getEffectivePrice(i.product_id, Number(i.product?.selling_price) || 0, ...);
  return s + price * i.quantity;
}, 0), [pricedItems, getEffectivePrice]);
```

### 3. Pass `hasUnpricedItems`, `allUnpriced`, `unpricedItems` to StepPayment

Add these to the `PaymentProps` interface and pass them down.

### 4. Show warning banner in StepPayment (above payment methods, around line 748)

If `hasUnpricedItems && !allUnpriced`: amber info banner —
> "⚠️ {count} item(s) in your cart don't have prices yet and will not be included in this order. Contact us for a quote on these items."

If `allUnpriced`: red/destructive banner —
> "All items in your cart require a quote. Please contact us for pricing."

### 5. Disable payment buttons when `allUnpriced`

- Dinger "Proceed to Secure Payment" button: add `|| allUnpriced` to disabled condition (line 817)
- COD "Place Order" button: same treatment
- Both buttons show grayed-out state

### Single file change
Only `src/pages/Checkout.tsx` is modified. No backend changes.


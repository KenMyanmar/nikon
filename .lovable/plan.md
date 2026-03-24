

# Fix: "Proceed to Checkout" Redirects Back to Cart on First Click

## Root Cause Found

In `src/pages/Checkout.tsx`, lines 218-220:

```tsx
useEffect(() => {
  if (customerId && cartItems.length === 0 && step < 3) navigate("/cart");
}, [customerId, cartItems, step, navigate]);
```

`cartItems` defaults to `[]` (line 77: `data: cartItems = []`). On first navigation to `/checkout`, the cart query hasn't loaded yet, so `cartItems.length === 0` is true. Combined with `customerId` being available (cached from the cart page), this useEffect fires immediately and redirects back to `/cart` before the cart data loads.

On the second click, React Query has cached the cart data, so `cartItems` is already populated and the redirect doesn't trigger.

## Fix — `src/pages/Checkout.tsx`

Add a loading guard to the empty-cart redirect. The cart query's loading state must be checked so we only redirect when we *know* the cart is truly empty, not when data is still loading.

**Change lines 218-220** from:
```tsx
useEffect(() => {
  if (customerId && cartItems.length === 0 && step < 3) navigate("/cart");
}, [customerId, cartItems, step, navigate]);
```

To:
```tsx
const { data: cartItems = [], isLoading: cartCheckoutLoading } = useQuery({ ... });

// Then in the useEffect:
useEffect(() => {
  if (customerId && !cartCheckoutLoading && cartItems.length === 0 && step < 3) navigate("/cart");
}, [customerId, cartCheckoutLoading, cartItems, step, navigate]);
```

This requires destructuring `isLoading` (renamed to `cartCheckoutLoading`) from the existing cart query on line 77, then adding `!cartCheckoutLoading` as a guard condition. One file, two small edits.




# Hide Promo Code Section When No Full-Price Items

## Summary
Conditionally hide the `CouponInput` component when all cart items already have flash deal or promotion discounts, since coupons only apply to full-price items anyway.

## Changes

### 1. `src/pages/CartPage.tsx`
- Wrap the `<CouponInput />` render (around line 373) with `{fullPriceSubtotal > 0 && <CouponInput ... />}`
- Also: when `fullPriceSubtotal` drops to 0 and a coupon was already applied, clear it (call `setAppliedCoupon(null)`) — add a `useEffect` watching `fullPriceSubtotal`

### 2. `src/pages/Checkout.tsx`
- The coupon is loaded from `sessionStorage` — if `fullPriceSubtotal === 0`, the `couponDiscount` already resolves to 0, so the display is correct
- If there's any coupon UI rendered in Checkout (coupon badge/display in order summary), wrap it with the same `fullPriceSubtotal > 0` guard

Two files, minimal conditional wraps. No new components.


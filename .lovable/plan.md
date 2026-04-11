

# Fix: Coupon Code System — Backend Discount Application

## Current State (after investigation)

**What already works:**
- Cart page: CouponInput validates against DB (code, dates, usage limit, min order, applies_to) ✓
- Cart page: Stores coupon in sessionStorage ✓
- Checkout page: Reads coupon from sessionStorage, displays discount line ✓
- Checkout page: Passes `p_coupon_code` to `place_order` RPC ✓
- `coupons` table: Exists with correct schema (columns: `type`, `discount_value`, `max_uses`, `max_uses_per_user`, `min_order_amount`, etc.) ✓

**What is broken:**
- `place_order` accepts `p_coupon_code` parameter but **never processes it** — `v_discount` stays at 0
- No coupon validation, no discount calculation, no `coupon_usage` insert, no `used_count` increment
- `coupon_usage` table missing `discount_amount` column (needed for audit trail)
- Frontend CouponInput doesn't check `max_uses_per_user` (per-customer usage limit)

## Plan

### 1. Database Migration — Single SQL migration

**a)** Add `discount_amount` column to `coupon_usage`:
```sql
ALTER TABLE coupon_usage ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
```

**b)** Replace `place_order` function to add coupon processing block between subtotal calculation and COD check:
- Look up coupon by `p_coupon_code` (case-insensitive)
- Validate: `is_active`, date range, `max_uses` vs `used_count`, `max_uses_per_user` vs existing usage for this customer
- Calculate discount: percentage (with `max_discount_amount` cap) or fixed_amount
- Apply only to full-price items (consistent with frontend exclusivity logic)
- Set `v_discount` so it flows into order total
- After order INSERT: insert `coupon_usage` record, increment `coupons.used_count`

### 2. Frontend — Add per-user usage check to CouponInput

In `CartPage.tsx` CouponInput's `handleApply`, after the `max_uses` check, add:
```typescript
// Per-user usage check
if (data.max_uses_per_user) {
  const { count } = await supabase
    .from("coupon_usage")
    .select("*", { count: "exact", head: true })
    .eq("coupon_id", data.id)
    .eq("user_id", user.id);
  if ((count || 0) >= data.max_uses_per_user) {
    setError("You have already used this coupon");
    return;
  }
}
```

### 3. Files Summary

| File | Action |
|------|--------|
| Migration SQL | Add `discount_amount` to `coupon_usage`, rewrite `place_order` with coupon logic |
| `src/pages/CartPage.tsx` | Add `max_uses_per_user` check in CouponInput |

No other frontend changes needed — sessionStorage persistence, checkout display, and RPC call are all already working.


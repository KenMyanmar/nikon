

# World-Class Checkout System — Implementation Plan

## Current State
- `CartPage.tsx` exists with working cart, coupon input, and a "Proceed to Checkout" button that shows a "Coming Soon" toast
- `place_order()` DB function already exists (see db-functions) — handles COD, KBZ Pay, MyanPay, idempotency, delivery fees, cart snapshot, and order number generation
- `AccountOrders.tsx` exists with basic order list but limited status badges and no payment proof upload
- `delivery_fees` table exists with zones, fees, COD eligibility, and thresholds
- `customer_addresses` table exists with all needed fields
- No `payment-proofs` storage bucket exists yet
- `place_order` is NOT in the generated Supabase types — will need type casting for `.rpc()` calls

## Database Changes

### 1. Create `payment-proofs` storage bucket (migration)
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Customers can upload their own payment proofs
CREATE POLICY "Customers upload payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = (SELECT id::text FROM customers WHERE user_id = auth.uid() LIMIT 1));

-- Customers can read their own proofs
CREATE POLICY "Customers read own proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = (SELECT id::text FROM customers WHERE user_id = auth.uid() LIMIT 1));

-- Staff can read all proofs
CREATE POLICY "Staff read all proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND is_active = true));
```

## New Files

### 2. `src/pages/Checkout.tsx` — 3-step checkout page (~600 lines)

**Structure**: Single page with step state (1: Delivery, 2: Payment, 3: Confirmation)

**Step Progress Bar**: Horizontal 3-step indicator (Truck, CreditCard, CheckCircle icons). Active = amber, completed = green, pending = gray.

**Step 1 — Delivery**:
- Fetch saved addresses from `customer_addresses` where `customer_id` matches
- Selectable address cards with radio buttons
- "Add New Address" form with fields: contact name, phone (09-XXX format), address line, township (dropdown of ~20 Yangon townships), city (default "Yangon"), region (dropdown: Yangon/Mandalay/Other), delivery notes, save checkbox
- Auto-fetch delivery fee from `delivery_fees` table based on region → zone mapping
- Display fee, estimated days, free delivery threshold
- COD eligibility warning if cart total exceeds zone's `max_cod_amount`
- "Continue to Payment" button validates required fields, optionally saves new address

**Step 2 — Payment**:
- Order summary sidebar (sticky on desktop, collapsible on mobile) showing cart items, subtotal, delivery fee, discount, total
- 3 payment method cards: COD (disabled if ineligible), KBZ Pay, MyanPay
- KBZ Pay / MyanPay expanded UI: transfer details, upload payment screenshot (to `payment-proofs` bucket), payment reference input
- "Place Order" button: disabled until method selected, shows total, loading spinner, double-submit prevention via idempotency key
- Calls `supabase.rpc('place_order', {...})` with all params

**Step 3 — Confirmation**:
- Success animation with order number from response
- Status-aware messaging (COD → "Confirmed", with proof → "Under Review", without proof → "Awaiting Payment")
- "Upload Payment Proof" button if no proof was uploaded
- "View My Orders" and "Continue Shopping" buttons

**Data flow**: Cart items fetched from `cart_items` + `products_public`. Customer info from `customers` table. Delivery fees from `delivery_fees`. Addresses from `customer_addresses`.

### 3. `src/pages/MyOrders.tsx` — Full order history page (~300 lines)

Standalone page (not inside Account tabs) with:
- Order list cards: order number, date, status badge (color-coded for all statuses including `confirmed_cod`, `awaiting_payment_proof`, `payment_under_review`, `payment_rejected`, etc.), total, item count
- Expandable order details: items table, delivery info, payment method/status
- Upload payment proof button for orders in `awaiting_payment_proof` or `payment_rejected` status
- Re-upload functionality for rejected payments (shows rejection reason)

## Modified Files

### 4. `src/pages/CartPage.tsx`
- Replace "Coming Soon" toast button with working navigation:
  - If all items priced: "Proceed to Checkout" → `navigate("/checkout")`
  - If some unpriced: show split messaging — priced items can checkout, unpriced items need quote. Block checkout button if ANY unpriced items exist with clear explanation.
  - If all unpriced: only show "Request Quote" button
- Update shipping line in summary to show "Calculated at checkout" instead of "Contact for quote"

### 5. `src/App.tsx`
- Add routes:
  - `/checkout` → `<Checkout />`
  - `/orders` → `<MyOrders />`
- No auth guard wrapper needed (pages handle auth internally like CartPage does)

### 6. `src/components/layout/Header.tsx`
- Update "My Orders" link in dropdown to point to `/orders` instead of `/account`

### 7. `src/components/account/AccountOrders.tsx`
- Update status badges to include all new statuses (`confirmed_cod`, `awaiting_payment_proof`, `payment_under_review`, `payment_rejected`, `packed`, `out_for_delivery`, `expired`)
- Add link to `/orders` for full order management

## Technical Notes

- `place_order` function is in the DB but not in generated types — will use `supabase.rpc('place_order' as any, {...})` with proper type casting for the response
- Region-to-zone mapping: Yangon → `yangon_metro`, Mandalay → `mandalay`, Other → `other` (matches `delivery_fees.zone` values)
- File upload path: `{customer_id}/{order_id_or_timestamp}/{filename}` in `payment-proofs` bucket
- All prices formatted as "MMK X,XXX" with `toLocaleString()`
- Mobile-first responsive with Tailwind breakpoints
- Navy + golden amber theme consistent with existing design

## Implementation Order
1. Storage bucket migration
2. Create `Checkout.tsx` (largest piece)
3. Create `MyOrders.tsx`
4. Update `CartPage.tsx`, `App.tsx`, `Header.tsx`, `AccountOrders.tsx`


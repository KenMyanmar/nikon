

# Prompt 6C: Authentication + Account Dashboard

## Overview
Build auth modal, account dashboard with 6 sections, auto-create customer on signup, add-to-cart integration, and header auth state. ~10 new files, ~4 modified files, 1 migration.

## 1. Database Migration

The `get_customer_id_for_user` function already exists. We need a trigger to auto-create a `customers` row on signup. Since we can't attach triggers to `auth.users`, we'll handle customer creation in the app after signup (check if customer exists, create if not).

```sql
-- Create a function + trigger isn't possible on auth schema.
-- Instead we'll use application-level logic after signup.
-- No migration needed since get_customer_id_for_user already exists.
```

**Actually**: We'll create the customer row in the signup handler code (after `supabase.auth.signUp`, call an edge function or insert into customers directly). The `customers` table RLS allows `ALL` where `user_id = auth.uid()`, so the authenticated user can insert their own row.

## 2. New Files

### `src/components/auth/AuthModal.tsx`
- Dialog overlay with Login/Signup tabs
- **Signup**: Full Name, Email, Password (min 8), Phone (optional), Company Name (optional), Company Type dropdown
- **Login**: Email, Password, "Forgot Password?" link
- On signup success: insert into `customers` table (name, email, phone, company_name, company_type, user_id)
- On login success: close modal
- Forgot password: call `supabase.auth.resetPasswordForEmail` with redirect to `/reset-password`
- Navy primary buttons, form validation with error messages, loading states
- Controlled via `open` + `onOpenChange` props

### `src/pages/ResetPassword.tsx`
- Route: `/reset-password`
- Detects `type=recovery` from URL hash
- Form to set new password, calls `supabase.auth.updateUser({ password })`

### `src/pages/AccountPage.tsx`
- Route: `/account`
- Protected: redirect to home if not logged in
- Desktop: sidebar nav | Mobile: horizontal tabs
- Sections: Overview, Orders, Quotes, Saved Lists, Addresses, Profile
- Each section is a sub-component within the file (or split into separate components if large)

### `src/components/account/AccountOverview.tsx`
- Welcome message, quick stats (order count, quote count, saved list count)

### `src/components/account/AccountOrders.tsx`
- Query `orders` table (RLS filtered), show list with status badges
- Expandable rows showing `order_items`

### `src/components/account/AccountQuotes.tsx`
- Query `quotes` table, show list with status, date, item count

### `src/components/account/AccountSavedLists.tsx`
- Query `saved_lists` + `saved_list_items`, CRUD operations
- Create/rename/delete lists, manage items

### `src/components/account/AccountAddresses.tsx`
- Query `customer_addresses`, CRUD with form
- Fields: label, address_line, township, city, region, contact_phone, delivery_notes
- Set default address

### `src/components/account/AccountProfile.tsx`
- Edit name, phone, company_name, company_type on `customers` table
- Read-only email field

### `src/hooks/useCart.ts`
- Shared hook: `useCartCount()` for header badge, `useAddToCart()` mutation
- Handles upsert logic (increment qty if product exists in cart)

## 3. Modified Files

### `src/App.tsx`
- Add routes: `/account` → `AccountPage`, `/reset-password` → `ResetPassword`

### `src/components/layout/Header.tsx`
- Import `useAuth` and `AuthModal`
- Logged out: "Account" button opens AuthModal
- Logged in: show first name + dropdown (My Account, My Orders, Saved Lists, Sign Out)
- Cart badge shows real count from `useCartCount()`

### `src/components/ProductCard.tsx`
- "Add to Cart" onClick: if not logged in → open auth modal (via context/callback), if logged in → call `useAddToCart`
- Show toast on success

### `src/pages/ProductDetail.tsx`
- Wire "Add to Cart" button to `useAddToCart` hook
- If not logged in, open AuthModal

## 4. Auth Context

Create `src/contexts/AuthContext.tsx`:
- Wrap app with auth provider exposing `user`, `loading`, `openAuthModal()`, `closeAuthModal()`
- AuthModal lives inside this provider so any component can trigger it
- This replaces direct `useAuth` calls in components that need the modal

## 5. Status Badge Colors
- Pending: amber (`bg-amber-100 text-amber-700`)
- Confirmed: blue (`bg-blue-100 text-blue-700`)
- Shipped: purple (`bg-purple-100 text-purple-700`)
- Delivered: green (`bg-green-100 text-green-700`)
- Cancelled: red (`bg-red-100 text-red-700`)

## 6. Implementation Order
1. `AuthContext` + `AuthModal` (signup creates customer row)
2. Wrap `App` with `AuthProvider`
3. Update `Header` (auth state, dropdown, cart count)
4. `useCart` hook (count + add-to-cart)
5. Wire `ProductCard` + `ProductDetail` add-to-cart
6. `AccountPage` with all 6 sub-sections
7. `ResetPassword` page + route
8. Add routes to `App.tsx`




# Fix: Saved Lists / Wishlist Feature

## Summary
Wire up the heart icon across the app with a centralized save/unsave hook. Add `is_default` column to `saved_lists` for clean default-list logic. Enhance the account saved lists page to show product details.

## Database Migration

Add `is_default` column to `saved_lists`:

```sql
ALTER TABLE saved_lists ADD COLUMN is_default BOOLEAN DEFAULT false;
```

No RLS changes needed — existing policies already cover all operations.

## File Changes

### 1. CREATE `src/hooks/useSavedItems.ts`

**`useSavedProductIds()`** — returns `Set<string>` of all saved product IDs for the current user:
- Get customer ID via `get_customer_id_for_user`
- Query `saved_list_items` joined through `saved_lists` where `customer_id` matches
- Query key: `["saved-items", userId]`

**`useToggleSave()`** — mutation hook:
- If not logged in → call `openAuthModal()`
- Get customer ID, find default list (`WHERE customer_id = X AND is_default = true`)
- If no default list → auto-create one (`name: "Saved Items", is_default: true`)
- If product already in set → DELETE from `saved_list_items`
- If not → INSERT into `saved_list_items`
- On success: invalidate `["saved-items"]` and `["saved-lists"]`
- Toast: "Saved to Saved Items" / "Removed from Saved Items"

### 2. UPDATE `src/components/ProductCard.tsx`

- Import `useSavedProductIds` and `useToggleSave`
- Heart button: call `toggleSave(productId)` on click
- Heart icon: filled red when saved (`fill-current text-red-500`), outline when not
- Always visible for saved items (remove `opacity-0 group-hover:opacity-100` when saved)

### 3. UPDATE `src/pages/ProductDetail.tsx`

- Add heart/save button next to the Add to Cart area
- Same toggle logic as ProductCard

### 4. UPDATE `src/components/account/AccountSavedLists.tsx`

- Fetch product details via join: `saved_list_items(*, products:product_id(id, title, slug, selling_price, images, brand_id))`
- Show product cards in a grid within each list (image, name, price)
- Add "Remove" button per product
- On remove: delete from `saved_list_items`, invalidate queries

## No other changes needed
- RLS policies already allow customers to manage their own saved lists and items
- No edge function changes


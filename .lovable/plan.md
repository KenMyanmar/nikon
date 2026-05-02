## Wire Download Invoice Button to `generate-invoice` Edge Function

### Important precondition (please confirm)
The prompt states the `generate-invoice` edge function is "already deployed", but it does **not** exist in this project's `supabase/functions/` directory (only `import-products`, `normalize-upload`, `send-order-email` are present). Before wiring the button, please confirm one of:
- (A) The function is deployed in Supabase but not committed here — proceed with frontend wiring only (this plan).
- (B) It needs to be created — I'll add a follow-up plan to scaffold the edge function (PDF generation, ownership/staff check, IKON branding).

The plan below covers frontend wiring only, per the prompt scope.

### Changes
Single file: `src/pages/Checkout.tsx`

1. **Add `handleDownloadInvoice` handler** (near `handleInvoiceToast` around line 1030).
   - Get current session via `supabase.auth.getSession()`. If no session → "Please sign in" destructive toast and return.
   - Show "Generating invoice…" toast.
   - `fetch` POST to `${VITE_SUPABASE_URL}/functions/v1/generate-invoice` with `Authorization: Bearer <access_token>`, `Content-Type: application/json`, body `{ order_id }`.
   - On non-OK: parse JSON error and throw.
   - On OK: read `blob()`, parse filename from `Content-Disposition` (fallback `invoice-<orderId8>.pdf`), trigger anchor download, revoke object URL.
   - Success/failure toasts.

2. **Wire both existing buttons** (both currently call `handleInvoiceToast`):
   - Line ~1095 (Thank You header, primary CTA row) → `onClick={() => handleDownloadInvoice(order.id)}`
   - Line ~1248 (Order Summary action row) → same.
   - Order id is available in the confirmation scope as `order.id` (loaded via the order query after `place_order` returns `orderData.order_id`).

3. **Remove `handleInvoiceToast`** (no longer referenced after step 2).

4. **Imports**: `Download` from `lucide-react` is already imported; `supabase` and `toast` are already imported. No new imports needed.

### Styling
Keep the current button markup (custom Tailwind classes matching the page's existing visual rhythm — emerald Track Order + neutral outline Download). The prompt's optional shadcn `<Button variant="outline">` swap is **not** applied to preserve consistency with surrounding buttons (Print, Send to Procurement, Service message). If you'd prefer the shadcn variant, say so and I'll switch all four to match.

### Testing checklist
1. Complete a COD checkout → on Thank You page, click Download Invoice → PDF downloads.
2. Filename comes from `Content-Disposition` (e.g. `INV-20260501-0001.pdf`).
3. Logged-out edge case: trigger via direct route w/ `?orderId=` while signed out → "Please sign in" toast.
4. Foreign order id → edge function returns 403, toast shows server error message.
5. Both buttons (header + summary row) work identically.

### Files changed
- `src/pages/Checkout.tsx` — add handler, wire two buttons, remove unused toast helper.
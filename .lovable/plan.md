## Redesign Checkout Step 3 (Order Confirmation)

Replace the minimal centered confirmation card in `src/pages/Checkout.tsx` with a full-width, information-rich confirmation page matching the mockup. Stays in-place — no new route.

### Data fetching (inside `StepConfirmation`)

Add a `useQuery` keyed `["order-confirmation", orderResult.order_id]` that runs once on mount:

```ts
supabase.from("orders")
  .select(`*, order_items(*, product:products_public(id, slug, description, stock_code, thumbnail_url, selling_price, currency, category_id))`)
  .eq("id", orderResult.order_id)
  .single()
```

Plus a second `useQuery` for the customer email — pull from `customers` table via `user_id = auth.uid()` (the user is authenticated at this point). Use the `customer` already fetched in the parent — pass it as a prop instead of re-querying.

A third `useQuery` for related products, enabled once the order data is available:
- Collect `category_id` from each `order_items[].product`.
- Collect `product_id` of every line item (to exclude).
- `supabase.from("products_public").select("id, slug, description, thumbnail_url, selling_price, currency, onhand_qty").in("category_id", catIds).not("id", "in", `(${purchasedIds.join(",")})`).not("thumbnail_url", "is", null).eq("is_active", true).order("onhand_qty", { ascending: false }).limit(8)`.
- Guard: if `catIds` is empty, skip.

Estimated delivery: compute from `order.created_at` + `feeRow.estimated_days` (already available in parent — pass `estimatedDays` as a prop). Parse the leading number from strings like "2-4 days" and add days; format as `Apr 30, 2026`. Fallback to plain "2-4 days" string display if parse fails.

### Component update — `StepConfirmation`

New props: `{ orderResult, paymentMethod, customerEmail, estimatedDays }`. Update the call site at line 538 to pass them.

Remove the existing `max-w-lg mx-auto` container. Render a full-width page with sections stacked, gap-8, max-w-6xl outer wrapper.

### Section 1 — Thank You Header

White card, `bg-card rounded-card shadow-card p-8`, centered content:
- `CheckCircle` (lucide) inside `w-16 h-16 bg-emerald-100 rounded-full` wrapper, icon `text-emerald-600 w-10 h-10`.
- "Thank you for your order!" — `text-3xl font-bold`.
- `Order Number:` followed by `order_number` in `text-emerald-700 font-mono font-bold`.
- `Confirmation email sent to: {customerEmail}` in `text-muted-foreground text-sm`.
- `Estimated Delivery: {computedDate}` in `text-foreground text-sm font-medium`.
- Button row: `Track Order` (`bg-emerald-600 text-white rounded-button px-5 py-2.5`, navigates to `/orders/{order.id}`) + `Download Invoice` (outlined `border border-border`, click → toast "Invoice download coming soon").

### Section 2 — Order Summary

White card. Title "Order Summary" `text-xl font-bold mb-4`.

**Progress stepper** — 4 stages: Order Received, Processing, Packed, Out for Delivery. First two completed (green filled circle with white check), last two pending (gray outline). Stages connected by a horizontal `h-0.5` line — green between completed, gray for pending. Sub-label "Today" under "Order Received" only. Implement as a flex row with 4 stage cells, each containing the circle + label; lines drawn via pseudo-elements / sibling `flex-1 h-0.5` divs between circles.

**Product table** — `<table>` with header row `Product | SKU | Qty | Unit Price | Total`. Each row: 48×48 thumbnail (or placeholder.svg), product `description` and a small SKU chip below in mobile, qty, `unit_price`, `total` (already on `order_items`). Use `border-b border-border/50` between rows. Mobile: cards instead of table.

**Totals block** — right-aligned, `max-w-sm ml-auto`:
- Subtotal: `fmt(order.subtotal)`.
- Shipping: green "Free" if `order.shipping_cost === 0`, else `fmt(order.shipping_cost)`.
- Tax: `fmt(order.tax)`.
- Discount: shown only if `order.discount > 0`, in red.
- Grand Total: `text-2xl text-emerald-700 font-bold`.

**Action button row** below totals — `Print Order` (Printer icon, `window.print()`), `Download Invoice` (Download icon, toast placeholder), `Send to Procurement Team` (Users icon, toast placeholder), `Service message` (MessageSquare icon, navigate `/contact`). All `variant="outline"` shadcn-styled or hand-rolled outlined buttons.

### Section 3 — "Customers who bought this also needed"

Heading `text-xl font-bold`. Horizontal scroll: `flex gap-4 overflow-x-auto pb-4 snap-x`. Each card `min-w-[220px] bg-card rounded-card border border-border shadow-card p-3`:
- 1:1 thumbnail.
- `description` truncated `line-clamp-2`.
- Price `fmt(selling_price)` in `text-emerald-700 font-bold`.
- "Add to Existing Order" button (small, `bg-foreground text-background` or `bg-emerald-600 text-white`) → toast "Visit product page to add to your next order" then `navigate('/product/' + slug)`.

If query returns 0 rows, hide the section.

### Section 4 — Two-column bottom

Grid `grid-cols-1 lg:grid-cols-3 gap-6`:

**Left (lg:col-span-2)** — "Manage Your Kitchen Procurement". 2×2 grid of static bundle cards:
- Restaurant Opening Package
- Commercial Kitchen Starter Kit
- Café Equipment Bundle
- Bakery Essentials Package

Each card: title, one-line subtitle, Unsplash kitchen-style placeholder image (use a small set of fixed Unsplash URLs already used in About/Contact for visual consistency), "View Bundle" button → toast "Bundle packages coming soon".

**Right** — "Need assistance?". Vertical list of clickable rows (`flex items-center gap-3 p-3 rounded-button hover:bg-muted/50`), each with icon + label + `ChevronRight`:
- Contact Account Manager (Users) → `/contact`
- Live Chat (MessageCircle) → `https://wa.me/959890090301`
- WhatsApp Procurement Support (MessageCircle/Phone) → same WhatsApp link
- Call 01-8650230 (Phone) → `tel:018650230`

### Visual + layout

- Outer wrapper: remove `max-w-lg mx-auto text-center`, replace with `max-w-6xl mx-auto space-y-8`.
- Alternate section backgrounds: white cards with `bg-card`, page background already inherits from parent `MainLayout`.
- All colors via existing tokens; emerald accents are allowed (Tailwind defaults), matching the mockup green.
- Loading state: while the order query is loading, show a skeleton block (header + table placeholder) instead of empty content.
- Error state: if the order query fails, fall back to the existing simple "Order Placed Successfully" header so users always see confirmation.

### Files

- `src/pages/Checkout.tsx` — only file changed. Edit `StepConfirmation` (line 946 onwards) and its call site (line 538). Add lucide imports `Printer, Download, Users, MessageSquare, MessageCircle, Phone, ChevronRight`.

### Out of scope

- No DB migrations.
- No new routes.
- No real invoice PDF generation, no real bundle data, no actual "add to existing order" backend — these are placeholder toasts as specified.

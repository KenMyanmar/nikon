## Investigation report (Step 0)

All seven items located in `src/pages/ProductDetail.tsx`:

a) **"Quote on request" price** — line 641–647. Keyed on `isEquipment`. Will be replaced by the 3-state matrix.
b) **EquipmentBadgesRow** — imported line 20, mounted line 869–872 (inside `isEquipment` branch of trust strip). Will be removed.
c) **Tab branching** — driven by `isEquipment` at lines 917–930 (Features hidden, Reviews hidden) and 996–1052 (Installation / Service / Warranty tabs added).
d) **Cold-Chain gate** — line 505 `{isEquipment && isRefrigeration && (...)}` with `isRefrigeration = product.category_name === "Refrigeration System"` defined line 379.
e) **Brand pillar "Made in {country} · Sold and serviced by IKON Mart Myanmar"** — lines 511–515.
f) **WhatsApp specialist link** — lines 793–800 (CTAs); also appears inside the equipment tabs at 1005, 1023, 1041 (those tabs are being removed anyway).
g) **Cart handler** — `addToCart(product.id, qty, product.description)` from `useAddToCart` (line 820). Reusable as-is for priced+in-stock equipment with no branching.

Also: `categoryPath` (line 385) currently joins parent + child with ` › ` and is pushed into both `infoRows` (line 389) and `keySpecs` (line 401). The mockup shows the parent category only (e.g. "Kitchen") — will simplify.

---

## Plan

Single-file edit (`src/pages/ProductDetail.tsx`) plus optional cleanup of unused imports.

### 1. Pricing block (lines 640–697) — STATE matrix
Replace the `isEquipment ? "Quote on request" : …` branch with:

```text
hasPrice = Number(product.selling_price) > 0
inStock  = stockState === 'in_stock'

if isEquipment && !hasPrice            → STATE 3: "Quote on request" (emerald)
else                                   → render MMK price (existing flashDeal/promotion/tier logic kept)
```

Non-equipment continues to use existing pricing logic untouched.

### 2. CTA block (lines 773–845) — STATE matrix
Replace the `isEquipment ? <Quote+Project+WhatsApp> : <Cart+BulkQuote>` branches with:

```text
isEquipment + STATE 1 (priced + in_stock):
  - Yellow "Add to Cart" (bg-accent / accent token) — calls existing addToCart
  - Blue "Request a Quote" with Phone icon (bg-primary) — calls handleRequestQuote

isEquipment + STATE 2 (priced + !in_stock):
  - Blue "Request a Quote" primary only
  - Caption: "Out of stock — request a quote for lead time"

isEquipment + STATE 3 (no price):
  - Blue "Request a Quote" primary only

Non-equipment: existing CTA logic unchanged.
```

Remove "Add to Project List" button and "Talk to a Specialist on WhatsApp" link from CTA stack.

### 3. Trust strip (lines 868–889)
For equipment, replace `<EquipmentBadgesRow>` with the four mockup rows:
- "Estimated Delivery: 3–5 Business Days" (no icon, bold label)
- ✓ "Free Shipping on orders over MMK 1,000,000" (emerald check)
- ✓ "30-Day Return Policy" (emerald check)
- 🔒 "Secure Payment" (lock icon)

Hide the Low Stock / "Only N left" suffix on the stock badge (line 603) when `isEquipment` — keep label only.

Remove the `EquipmentBadgesRow` import (line 20). Component file stays on disk (out of scope to delete).

### 4. Brand pillar (lines 511–515)
Delete the `<p>` with "Made in … Sold and serviced by IKON Mart Myanmar". Brand logo + name stays.

### 5. Cold-Chain badge (line 505)
Remove the `isRefrigeration` gate so the badge renders for all `isEquipment` products. Remove the now-unused `isRefrigeration` constant (line 379).

### 6. Tabs (lines 912–1052)
Remove all `isEquipment` branching in tabs. Render the four standard tabs for everyone: **Description / Specifications / Features / Reviews**. Delete the Installation / Service / Warranty `TabsContent` blocks (1051 lines collapse). The Reviews tab content (1054→) becomes unconditional — drop the `{!isEquipment && (` wrapper.

### 7. Star strip (lines 530–536)
Already renders unconditionally — no change. The "No reviews yet" text already shows. Confirmed visible for equipment after tab unification.

### 8. Category label (lines 385–401)
Change `categoryPath` from joined string to use `product.parent_category_name` only (simple "Kitchen"). Both the `infoRows` Category entry and `keySpecs` Category entry become the single parent label, matching the mockup. Breadcrumbs at top of page are out of scope and stay as-is (real navigation crumbs).

### 9. Add to Project List
Confirmed retired by removal from CTA block in step 2. `handleAddToProjectList` function (lines 102–133) becomes dead code — leave in place (out of scope to chase down).

---

## Verification

- Typecheck.
- Manual screenshots for the four acceptance SKUs (STATE 1 priced+in-stock gas boiling top, STATE 2 priced+OOS, STATE 3 quote-only tumble dryer, non-equipment camcover) + 320px mobile of STATE 1.
- Confirm `/request-quote?product_id=…&sku=…` deep link still fires from the blue button.

## Out of scope (untouched)
SparePartsRail, ProjectWizardGrid, Detailed Specifications table, Kitchen Equipment Care callout, footer trust strip, /request-quote page, DB columns, MMK 1,000,000 free-shipping threshold (placeholder per prompt).

# Equipment PDP — Final Layout Push

## Investigation findings

**a) Datasheet link** — `src/pages/ProductDetail.tsx` lines 577–587 (middle column, after Key Specifications card). Plain text link with FileText icon.

**b) Brand double-render** — `src/pages/ProductDetail.tsx` lines 497–511. Renders `<img src={brand_logo}>` (line 501) AND `<span>{brand_name}</span>` (line 503) side-by-side. When the logo image itself contains the wordmark "HOSHIZAKI", the adjacent span produces visual duplication.

**c) Project Wizard tiles** — `src/components/product/ProjectWizardGrid.tsx`. All 4 tiles are `<a href="#">`. No navigation wiring.

**d) Inline Cold-Chain chip** — `src/pages/ProductDetail.tsx` lines 504–508 (next to brand name, ungated on `isEquipment`). No full-width Cold-Chain block exists yet. Target mount point: between tabs section (ends line 1148) and `SparePartsRail` (line 1181).

**e) SparePartsRail** — Mounted at `ProductDetail.tsx` line 1181. Component at `src/components/product/SparePartsRail.tsx`. Currently uses horizontal scroll (`flex gap-4 ... overflow-x-auto`, `min-w-[220px]`). Needs to be a responsive grid per mockup.

## Edits

### Edit 1 — Brand area cleanup (Delta 2 + 4)
`ProductDetail.tsx` lines 497–511. New logic:
- If `brand_logo` exists → render logo image only (no `<span>` with brand name).
- Else → render brand name span as fallback.
- Remove the inline Cold-Chain chip (lines 504–508) entirely.

### Edit 2 — Remove datasheet link from middle column (Delta 1a)
`ProductDetail.tsx` lines 577–587. Delete the entire `{product.datasheet_url && (...)}` block.

### Edit 3 — Add "CAD & Spec Downloads" card in right sidebar (Delta 1b)
`ProductDetail.tsx` — inside the right column (col-span-3 block), append a new card AFTER the existing sticky price/CTA card (around line ~890, end of col 3). Only renders when `product.datasheet_url` is set.

Markup:
```
<div class="border border-border rounded-lg bg-card p-4 mt-4">
  <h3 with DownloadCloud icon + "CAD & Spec Downloads">
  <div role="row">
    <FileText icon (PDF) | "Technical Specification" + "PDF" subtext | Download arrow icon
    href={datasheet_url} target=_blank
  </div>
</div>
```
File-size not computed (would need HEAD request) — label only, per data reality.

### Edit 4 — Full-width Cold-Chain block (Delta 4)
`ProductDetail.tsx` — insert new section right before `SparePartsRail` mount (line 1181), gated on `isEquipment` (ungated by category per strict-mockup decision):

```
{isEquipment && (
  <section className="mt-10 rounded-xl bg-sky-50 border border-sky-200 p-6 md:p-8 flex items-center gap-6">
    <ShieldCheck className="w-10 h-10 text-sky-700 shrink-0" />
    <div className="flex-1">
      <h3 className="text-lg md:text-xl font-bold text-sky-900">Cold-Chain Verified</h3>
      <p className="text-sm text-sky-800 mt-1">Equipment tested & verified for consistent performance in cold-chain environments.</p>
    </div>
    <div className="hidden md:flex w-20 h-20 rounded-full bg-white border-2 border-sky-300 items-center justify-center shrink-0">
      <Snowflake className="w-10 h-10 text-sky-700" />
    </div>
  </section>
)}
```

(Using Snowflake-in-circle as the "seal" since no dedicated seal asset exists. ShieldCheck already imported.)

### Edit 5 — ProjectWizardGrid navigation (Delta 3)
`src/components/product/ProjectWizardGrid.tsx`:
- Import `useNavigate` from `react-router-dom`.
- Change `<a href={href}>` tiles to `<button onClick={() => navigate("/request-quote")}>`.
- Drop the `href: "#"` from the WIZARDS array (or ignore it).

### Edit 6 — SparePartsRail grid styling (Delta 5)
`src/components/product/SparePartsRail.tsx`:
- Replace `flex gap-4 ... overflow-x-auto scrollbar-hide` container with `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`.
- Remove `min-w-[220px] max-w-[260px] flex-shrink-0` wrapper divs (let grid handle sizing).
- Section title styling already left-aligned and bold — keep.
- Card styling (thumbnail / caps name / MMK price color / yellow Add-to-Cart) is delegated to the existing `<ProductCard>` component which is governed by the design system — out of scope to retheme here.

## Acceptance
1. HOSHIZAKI freezer: CAD & Spec block in right sidebar with one PDF row; brand area shows logo only; full-width Cold-Chain block after tabs; no inline Cold-Chain chip at top.
2. Gas Boiling Top: same fixes; CAD block hidden (no `datasheet_url`).
3. Any wizard tile click → `/request-quote`.
4. Camcover plate (non-equipment): unchanged (Cold-Chain block, SparePartsRail, ProjectWizardGrid all already gated on `isEquipment` or empty).
5. Typecheck passes.

## Out of scope
3-state CTA matrix, trust strip, tab set, /request-quote page, schema, CAD/DWG column, parent_equipment_id backfill, file-size HEAD computation.

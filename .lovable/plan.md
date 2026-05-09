# Services Page + Nav Wiring

Migration 25 is already applied — the `services` table exists with all required columns (slug, title, short_description, long_description, icon, image_url, cta_label, cta_query, sort_order, is_featured, is_active). This is a frontend-only change.

## Part A — Navigation wiring

**`src/components/layout/Header.tsx`** — `UTILITY_LINKS` (line 22): insert `{ label: "SERVICES", to: "/services" }` between ABOUT US and ARTICLES. Active highlight is already handled by the existing `NavLink` `isActive` styling.

**`src/components/layout/MegaMenu.tsx`** — `PAGES` array (line 255) in `MobileMegaNav`: insert the same Services entry between ABOUT US and ARTICLES.

**`src/components/layout/Footer.tsx`** — `ABOUT_LINKS` (line 11): insert `{ label: "Our Services", href: "/services" }` after "Our Story". The existing desktop column (line 180) and mobile accordion (line 268) both render `ABOUT_LINKS`, so one edit covers both.

## Part B — `/services` page

**Files to create**
- `src/pages/ServicesPage.tsx` — page shell, hero, trust strip, services grid, "How We Deliver" 3-step, notable projects strip, bottom CTA banner. Static copy from Part C of the brief.
- `src/components/services/ServiceCard.tsx` — card per the spec: image (or icon fallback via dynamic Lucide lookup), title, short description, CTA button linking to `/request-quote?{cta_query}` (or plain `/request-quote`).
- `src/hooks/useServices.ts` — React Query hook hitting `services` with `is_active=true`, ordered by `is_featured DESC, sort_order ASC`. 5-minute staleTime per project caching policy.

**Router** — `src/App.tsx`: add `<Route path="/services" element={<ServicesPage />} />` above the catch-all, alongside the existing `/about`, `/articles`, `/contact` routes.

**States**
- Loading: 3 skeleton cards.
- Empty (launch state, all rows `is_active=false`): hero, trust strip, "How We Deliver", projects strip, and bottom CTA still render. Grid section shows a "Services coming soon — get in touch" block with a Contact link.
- Partial (1–2 rows): render naturally in the grid; no placeholder padding.

**Long description rendering contract** (Part B.1): if/when `long_description` is rendered, use `<div className="whitespace-pre-wrap">{value}</div>`. Never `dangerouslySetInnerHTML`. v1 doesn't show long_description on the index page, but the rule is encoded in `ServiceCard` so future expanded views inherit it.

**SEO** — Set `<title>`, `<meta name="description">`, `og:title`, `og:description` per spec via direct `document.title` / `<meta>` updates in a `useEffect` (matching the pattern used elsewhere in the project — no Helmet dependency added).

**Design tokens** — All colors via semantic tokens (`bg-primary`, `text-foreground`, `bg-muted`, `border-border`, etc.). Inter / Noto Sans Myanmar inherited. No new hexes.

## Acceptance verification
- Services link appears in desktop top nav (between About Us and Articles), mobile drawer Pages section, and Footer "About IKON" column.
- `/services` renders without console errors when logged out and when the table has 0 active rows.
- Toggling `is_active` on a row reflects within React Query staleTime (5 min) or on refresh; featured rows render first; ties broken by `sort_order` ASC.
- Each card CTA navigates to `/request-quote?service=<slug>` when `cta_query` is set; otherwise to `/request-quote`.
- Responsive at 360 / 768 / 1280 (1-col / 2-col / 3-col grid).

## Out of scope
- No DB migrations (Migration 25 already applied; verified columns present).
- No `/services/:slug` detail page, no bilingual toggle, no region filters, no lead-magnet capture.
- No CRM / admin editor changes.
- No header structure changes beyond inserting the link.

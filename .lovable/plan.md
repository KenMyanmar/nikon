## Homepage Visual Upgrade — 3 sections

Verified pre-flight against DB: all 10 parent categories (`depth=0`, `is_active=true`) have `image_url` populated and `sort_order` 1–10 (Tableware → … → Spare Parts). The `category-images` bucket exists. No DB changes required.

A note on the prompt's spec for biz-type tiles: those filenames (`biz-hotel.jpg`, `biz-restaurant.jpg`, etc.) are referenced as already uploaded — I will trust the prompt and use the URLs as-is. If any return 404 in QA, plan B is solid-color fallback per Part 1's pattern (no broken images shipped).

---

### Part 1 — Rebuild `src/components/home/CategoryQuickNav.tsx`

Replace the icon-tile implementation with photographic tiles.

- **Query:** drop the `product_groups` query entirely. Single query against `categories`:
  ```ts
  .from("categories")
  .select("name, slug, image_url, product_count")
  .eq("depth", 0)
  .eq("is_active", true)
  .order("sort_order", { ascending: true });
  ```
  staleTime 5 min (Core caching policy).
- **Tile** (`<Link to={`/category/${slug}`}>`):
  - `group relative overflow-hidden rounded-xl aspect-[4/3] block`
  - 1px `border-border` (Design Contract: cards have a border, no resting shadow)
  - Image: `<img src={image_url} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />`
  - Gradient overlay: `absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`
  - Text block (`absolute bottom-0 left-0 right-0 p-4`):
    - Name: `text-lg font-semibold text-white` (full DB name, no truncate)
    - Count: `text-sm text-white/80` — `{product_count.toLocaleString()} items`
  - Focus-visible: 2px navy ring offset 2 (matches existing pattern).
- **Fallback:** if `image_url` is null → render a `bg-muted` block with name in `text-foreground` and count in `text-muted-foreground` (no broken `<img>`). Verified moot today (all 10 populated) but kept for resilience.
- **Layout:** `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4` for both mobile and desktop. Drops the existing mobile snap-scroll variant in favor of the prompt's wrapping grid.
- **Heading:** keep `Shop by category` (Inter, semibold, existing token sizing).
- **Loading:** 10 `<Skeleton className="aspect-[4/3] rounded-xl" />` in the same grid.
- **No motion violation:** `group-hover:scale-105` on image is interaction feedback (allowed), not decorative ambient motion.

### Part 2 — Create `src/components/home/ShopByBusinessType.tsx`

Static, hardcoded array (no DB). 5 cards using the URLs from the prompt:

| Label | Image | Link |
|---|---|---|
| Hotel | `…/biz-hotel.jpg` | `/category/bedroom-supplies` |
| Restaurant | `…/biz-restaurant.jpg` | `/category/tableware` |
| Cafe & Bakery | `…/biz-cafe.jpg` | `/category/f-and-b-solutions` |
| Bar & Pub | `…/biz-bar.jpg` | `/category/kitchen-utensils` |
| Catering | `…/biz-catering.jpg` | `/category/buffet-and-banquet` |

- Section: `container mx-auto px-4 py-10`, heading `Shop by Business Type` (same style as Part 1 heading).
- Card (`<Link>`): `group relative overflow-hidden rounded-xl aspect-[3/2] block`, 1px border.
- Image: `object-cover w-full h-full group-hover:scale-105 transition-transform duration-300`.
- Overlay: `bg-gradient-to-t from-black/60 via-black/30 to-black/10`.
- Label: centered via `absolute inset-0 flex items-center justify-center`, text `text-xl md:text-2xl font-bold text-white drop-shadow-md`.
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4`.

### Part 3 — Create `src/components/home/QuoteCTA.tsx`

A minor variant of the existing `QuotationCTA.tsx` (which is already navy bg + amber button), aligned to the new copy.

- Section: `bg-primary py-12 md:py-16` (navy `#1B2A4E` per Design Contract).
- Container: `container mx-auto px-4 text-center max-w-2xl`.
- Heading: `text-2xl md:text-3xl font-bold text-primary-foreground` — "Need a Custom Quote for Your Project?"
- Subtext: `text-primary-foreground/70 mt-3` — "Tell us what you need and our team will prepare a tailored quotation for your hotel, restaurant, or catering business."
- Button: `<Link to="/request-quote">` styled as amber CTA (`bg-accent text-accent-foreground`, size lg, rounded-button, `mt-6`, with `<ArrowRight />`).
- Secondary line: `mt-3 text-sm text-primary-foreground/60` — "Or call us at 09 89009 0301" (plain text, matches `mem://business/contact-info`).
- Token-only: no raw hex, all via tokens (Core rule).

Note: this duplicates `QuotationCTA` in style — I'll use the new `QuoteCTA.tsx` as the prompt specifies but keep `QuotationCTA.tsx` untouched (it may be referenced elsewhere — won't audit/remove this prompt).

### Part 4 — Wire into `src/pages/Index.tsx`

New section order:

```text
HeroBannerSection
CategoryQuickNav            (now photographic)
ShopByBusinessType          NEW
QuoteCTA                    NEW
BestSellers
FlashDealsRow
TrustBadgeBar
HoReCaResources
```

Imports added; no other changes to existing sections.

---

### Files changed

- `src/components/home/CategoryQuickNav.tsx` (rewrite — photographic tiles, single `categories` query, `sort_order` ordering)
- `src/components/home/ShopByBusinessType.tsx` (new)
- `src/components/home/QuoteCTA.tsx` (new)
- `src/pages/Index.tsx` (imports + 2 new section placements)

### Out of scope / non-goals

- No DB migration (image_url + sort_order already set).
- `QuotationCTA.tsx` left in place untouched.
- No changes to MegaMenu/Footer/AllCategoriesPage (those already use `sort_order` from the prior prompt).
- Locked components (Header, Footer, MegaMenu) untouched.

### Manual QA checklist after build

1. 10 photographic tiles in order Tableware → Spare Parts; counts match DB.
2. Tile click → SPA nav to `/category/<slug>`.
3. 5 business-type cards render with images and centered labels; clicks route correctly. If any image 404s, replace src or fall back.
4. Quote CTA button routes to `/request-quote`.
5. 866px (current viewport): category grid = 3 cols (sm breakpoint), business grid = 3 cols, CTA stacked and centered.
6. 390px mobile: both grids = 2 cols, no overflow.
7. Hover scale present on tiles; no ambient/decorative motion.
8. No console errors; no raw forbidden hexes introduced.

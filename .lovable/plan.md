# Reorder Category Navigation — Spare Parts to End

## Audit results — every `.from("categories")` query

Project-wide search surfaced 12 category queries across 8 files. Classified below.

### Top-level (depth=0) display lists — CHANGE to `sort_order` ASC

| File | Line | Current | Notes |
|---|---|---|---|
| `src/components/layout/MegaMenu.tsx` | 44 | `.order("name", { ascending: true })` | **LOCKED component** — desktop nav `mainCategories` |
| `src/components/layout/Footer.tsx` | 128 | `.order("name", { ascending: true })` | **LOCKED component** — footer "Shop by Category" column |
| `src/pages/AllCategoriesPage.tsx` | 17 | `.order("name")` | Standalone /categories page header order |

### Already correct — NO change

| File | Line | Sort | Status |
|---|---|---|---|
| `src/components/home/CategoryQuickNav.tsx` | 50 | `sort_order` ASC | **LOCKED** — already correct, do not touch |
| `src/components/home/FeaturedCategories.tsx` | 16 | `sort_order` | Already correct |
| `src/pages/CategoryPage.tsx` | 62–63 | `sort_order` then `name` | Sub-categories of a parent — already correct |

### Sub-categories only (depth=1) — LEAVE as-is per spec

| File | Line | Filter | Notes |
|---|---|---|---|
| `src/components/layout/MegaMenu.tsx` | 59 | `depth=1` | Sub-categories shown inside hover dropdowns, grouped by parent client-side. Spec says depth=1 queries leave existing sort. |
| `src/pages/AllCategoriesPage.tsx` | 31 | `depth=1` | Sub-categories listed under each parent section. Same rationale. |

### Not in scope — single-row lookups or non-categories

`src/pages/CategoryPage.tsx` lines 27, 43 (single-row lookups, no `.order`), `src/pages/ProductDetail.tsx` line 179 (single-row lookup), `src/pages/AllBrandsPage.tsx` (brands query at line 26).

### No mixed depth=0+depth=1 queries found

Nothing to flag. Every query that currently controls top-level order can be cleanly switched.

## Locked-component disclosure (Rule 18 transparency)

Per the post-marathon locked list, this fix touches **two locked components**:

1. **`src/components/layout/MegaMenu.tsx`** — single-line change to the `mainCategories` query order clause (line 44). No layout, font-size, or padding changes. `text-[12px]` and `px-2.5` preserved (Rule 20).
2. **`src/components/layout/Footer.tsx`** — single-line change to the footer-categories query order clause (line 128). No structural or token changes.

`CategoryQuickNav.tsx` (also locked) is already on `sort_order` and will not be touched.

## Changes (3 lines, 3 files)

```text
src/components/layout/MegaMenu.tsx:44
- .order("name", { ascending: true });
+ .order("sort_order", { ascending: true });

src/components/layout/Footer.tsx:128
- .order("name", { ascending: true });
+ .order("sort_order", { ascending: true });

src/pages/AllCategoriesPage.tsx:17
- .order("name");
+ .order("sort_order", { ascending: true });
```

No DB migration (already applied separately). No other code changes.

## Acceptance evidence (Rule 12)

Capture and commit to `docs/build-screenshots/post-marathon/category-sort-order/`:

- `desktop-nav-1366x768.png` — full nav row, expected order: Tableware → Kitchen Utensils → Housekeeping Supplies → Food Services → Kitchen Services → Bedroom Supplies → Buffet & Banquet → Food & Beverage → Laundry Solutions → Spare Parts
- `footer-categories.png` — same order in footer column
- `mobile-drawer.png` — mobile hamburger Categories list in same order
- `actual-viewport-truncation-check.png` — capture at Ken's actual viewport (`window.innerWidth` reported in build report)
- `README.md` — Rule 18 two-column gate + Rule 14 copy verification

## Truncation rule

If "Spare Parts" (11 chars, +2 vs prior rightmost "Tableware") truncates at Ken's viewport: STOP, report viewport width and clip amount. Do NOT alter font size, padding, or layout to compensate — that's a separate re-lock decision.

## Out of scope

- Sub-category sort order inside dropdowns (left as `name` ASC per spec)
- Any token, font, padding, or layout change
- Brands queries
- Database changes (already applied)

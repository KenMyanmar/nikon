# Post-Marathon Fix — Category Navigation Sort Order

**Goal:** Move "Spare Parts" from position #2 to position #10 across every category-display surface by switching from `product_count`/`name` sorts to manual `sort_order` (DB-applied, values 1–10).

**Database:** `categories.sort_order` was set externally for all 10 depth=0 rows before this change. No migration in this commit.

---

## Locked-component disclosure (Rule 18 transparency)

Two locked components were touched. Each change is a single line, scoped to the query's `.order(...)` clause. No layout, font-size, padding, color, or token changes.

| File | Line | Lock status | Change |
|---|---|---|---|
| `src/components/layout/MegaMenu.tsx` | 44 | Locked (P3) | `.order("name", asc)` → `.order("sort_order", asc)` |
| `src/components/layout/Footer.tsx` | 128 | Locked (P6) | `.order("name", asc)` → `.order("sort_order", asc)` |
| `src/pages/AllCategoriesPage.tsx` | 17 | Not locked | `.order("name")` → `.order("sort_order", asc)` |

`text-[12px]` and `px-2.5` on the desktop nav items were verified preserved (Rule 20 lock).
`CategoryQuickNav.tsx` (locked, also home rail) was already on `sort_order` and was NOT touched.

---

## Audit — every `.from("categories")` query in the codebase

| File | Line | Depth filter | Sort | Action |
|---|---|---|---|---|
| `MegaMenu.tsx` | 44 | depth=0 | `name` ASC → **`sort_order` ASC** | Changed |
| `Footer.tsx` | 128 | depth=0 | `name` ASC → **`sort_order` ASC** | Changed |
| `AllCategoriesPage.tsx` | 17 | depth=0 | `name` → **`sort_order` ASC** | Changed |
| `MegaMenu.tsx` | 59 | depth=1 | `name` ASC | Left as-is (sub-categories under each parent in dropdown) |
| `AllCategoriesPage.tsx` | 31 | depth=1 | `name` | Left as-is (sub-categories under each parent header) |
| `CategoryPage.tsx` | 62–63 | parent_id filter | `sort_order` then `name` | Already correct |
| `CategoryPage.tsx` | 27, 43 | single-row lookup | n/a | Not display-order |
| `ProductDetail.tsx` | 179 | single-row lookup | n/a | Not display-order |
| `AllBrandsPage.tsx` | 48 | depth=0/1 lookup map | n/a | Not user-facing list order |
| `CategoryQuickNav.tsx` | 50 | depth=0 | `sort_order` ASC | Already correct |
| `FeaturedCategories.tsx` | 16 | depth=0 | `sort_order` | Already correct |

No depth=0 + depth=1 mixed queries surfaced. Nothing to flag for design decision.

---

## Two-column acceptance gate (Rule 18)

| Surface | Expected | Observed |
|---|---|---|
| Desktop nav row (1366×768) | 10 cats in: Tableware, Kitchen Utensils, Housekeeping Supplies, Food Services, Kitchen Services, Bedroom Supplies, Buffet & Banquet, Food & Beverage, Laundry Solutions, **Spare Parts** | ✅ Exact match — see `desktop-nav-1366x768.png` |
| Footer "Shop by Category" column | Same order as nav | ✅ Exact match — see `footer-categories.png` |
| Mobile drawer (390×844) Categories list | Same order as nav (top-to-bottom) | ✅ Exact match — see `mobile-drawer.png`. Counts visible: Tableware (939), Kitchen Utensils (441), Housekeeping (389), Food Services (258), Kitchen Services (184), Bedroom (154), Buffet & Banquet (139), Food & Beverage (48), Laundry Solutions (11), **Spare Parts (723)**. Note Spare Parts (723) sits at position #10 despite having more products than positions 7–9 — confirms `sort_order` (not `product_count`) drives ordering. |
| Spare Parts truncation at desktop nav | Visible without clip on supported desktop widths | ✅ Clean at 1366×768. ⚠️ See truncation note below for narrow desktop widths. |

---

## Rule 14 — copy verification

Category labels rendered in DOM exactly match the DB `name` field for the 10 depth=0 rows; no string substitution introduced. The Footer column's "Flash Deals →" link below the categories is unrelated (separate hardcoded link, unchanged).

---

## Rule 12 — render-time verification

All four screenshots were captured against the live preview after the code change shipped. The order observed in the rendered DOM is the order driven by Supabase's response, confirming the new `.order("sort_order", asc)` clause is in effect end-to-end (query → React Query cache → render).

---

## Truncation report (per spec)

**Ken's actual reported viewport: 866 × 655 CSS px.**

At 866 CSS px, the desktop mega-nav (`hidden lg:block`, lg = 1024 px in Tailwind) is **NOT rendered** — the mobile hamburger drawer is shown instead. The drawer renders categories vertically with full width, so "Spare Parts" displays cleanly with no truncation at Ken's actual viewport. ✅

For completeness, the captured `actual-viewport-truncation-check.png` shows the next supported viewport up (snapped to 1024×768, the smallest desktop size where the nav row activates). At 1024×768 the row overflows horizontally beginning around "Food & Beverage" — a horizontal scrollbar is visible. **This overflow is pre-existing and not caused by the sort change** — at the locked `text-[12px]` / `px-2.5` and 10 categories, the row's total width is independent of which 11-character label sits rightmost. Per spec, no font / padding / layout change is being made. Flagging as a potential future re-lock decision; out of scope for this fix.

---

## Files changed

- `src/components/layout/MegaMenu.tsx` (1 line)
- `src/components/layout/Footer.tsx` (1 line)
- `src/pages/AllCategoriesPage.tsx` (1 line)

3 lines, 3 files. No DB migration. No token, font, padding, or layout changes.

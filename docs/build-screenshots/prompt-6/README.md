# Prompt 6 — Trust Signals + Final Polish

Acceptance gate evidence for the marathon's cross-cutting cleanup prompt.

---

## Visual evidence (6 files)

| File | What it verifies |
|---|---|
| `desktop-1366x768-homepage-above-fold.png` | Hero + category rail visible, ClientLogos gap closed (no marquee between FlashDealsRow and TrustBadgeBar), no WhatsApp green bubble in any corner. Header MegaMenu nav row reads **"Food & Beverage"** (not "F & B Solutions"). |
| `desktop-1366x768-nav-megamenu.png` | Header MegaMenu hovered open on the F&B parent. Both the nav row chip ("Food & Beverage") and the mega-panel header ("FOOD & BEVERAGE") + footer link ("View All Food & Beverage →") inherit the canonical DB rename. |
| `desktop-1366x768-footer.png` | Full footer surface: 5-column grid (About IKON / Shop by Category / Customer Service / Resources / Connect). Pillar zone shows **Since 1995 / 160+ Brands / CCI France Myanmar Member** with Calendar / Award / BadgeCheck Lucide icons at 20px in muted-foreground (no amber). Newsletter, payment chips, legal row all on uniform navy with semantic-token text/borders. Footer Flash Deals link in plain amber text (no urgency-red). |
| `mobile-390x844-homepage-above-fold.png` | Mobile chrome unchanged — Hero, "Shop by category" intro, MobileBottomNav (Home/Categories/Search/Cart/Account). No floating WhatsApp bubble. |
| `mobile-390x844-drawer-open.png` | Hamburger drawer Categories list shows **"Food & Beverage (48)"** in alphabetical position. DB rename propagated to mobile drawer via single `cat.name` query — no separate component override needed. |
| `desktop-1366x768-hovers-static.png` | Contact page Department cards with cursor hovering "Sales" card. Card is **flat and identical to siblings** — no lift, no shadow, no transform, no color change. Decorative motion confirmed dead. |

---

## Rule 18 — Two-column gate

| Lock | Status | Evidence |
|---|---|---|
| **Decision 1: ClientLogos dropped entirely** | ✅ Resolved | `src/components/home/ClientLogos.tsx` deleted. `src/pages/Index.tsx` mount removed. Homepage above-fold screenshot shows clean transition from FlashDealsRow → TrustBadgeBar. |
| **Decision 2: Footer pillars replaced** | ✅ Resolved | Pillar copy: "Since 1995 / 30 years supplying Myanmar HoReCa", "160+ Brands / Authorized distributor network", "CCI France Myanmar / Member". Icons: Calendar, Award, BadgeCheck. Size: 20px. Color: `text-primary-foreground/60` (muted, no amber). No motion. Vague "Luxury/Quality/Reliability" register retained on `/about` Vision per scope split. |
| **Decision 3: WhatsApp floating button dropped** | ✅ Resolved | `src/components/WhatsAppButton.tsx` deleted. `src/components/layout/MainLayout.tsx` mount removed. Both desktop and mobile screenshots show clean bottom-right corners. Footer's WhatsApp social icon retained (discoverable, not persistent CTA). |
| **Decision 4: Cleanup scope split** | ✅ Resolved | In-scope items all completed. Out-of-scope items (About re-tokenization, Articles/ArticleDetail re-tokenization, Contact hero gradient + #25D366, CartPage #F97316, 6 legal route stubs, lov.json legacy tokens, editorial card image-zoom KEPT) remain in `mem://infra/deferred-items` Phase 2. |
| **Decision 5: F&B → Food & Beverage canonical** | ✅ Resolved | Single-row migration: `UPDATE categories SET name='Food & Beverage' WHERE slug='f-and-b-solutions' AND depth=0`. Verified via `psql` post-migration. Header MegaMenu, Mobile Drawer, Footer category column all show "Food & Beverage" (single DB write, all surfaces inherit). `src/lib/categoryIcons.ts` updated with `food & beverage` as canonical primary key, `f & b solutions` and `f&b solutions` retained as backward-compat. |
| **Footer hex re-tokenization** | ✅ Resolved | All 12 raw hex codes (`#1a1f36`, `#0f1729`, `#111827`, `#0a0e1a`, `#374151`, `#1f2937`, `#9ca3af`, `#d1d5db`, `#6b7280`, `#f59e0b`, `#fbbf24`, `#d97706`) replaced with semantic tokens. Substitution map: dark surfaces → `bg-primary` / `bg-primary/95`; primary text → `text-primary-foreground`; muted text → `text-primary-foreground/{60,70,80}`; borders → `border-primary-foreground/{10,20}`; brand-accent links + Subscribe button → `text-accent` / `bg-accent`. |
| **Decorative motion removed** | ✅ Resolved | Files touched: `src/components/home/ShopByBusinessType.tsx` (removed `hover:scale-[1.03]`, `group-hover:scale-110`, `group-hover:bg-black/10`, `hover:shadow-lg`, `transition-transform`, `transition-colors`). `src/pages/FlashDealsPage.tsx` (removed `group-hover:scale-105 transition-transform` from product image). `src/pages/Contact.tsx` (removed `hover:shadow-card-hover hover:-translate-y-0.5 transition` from department cards). |

---

## Rule 14 — Copy verification block

| Locked string | Surface | Verified |
|---|---|---|
| "Since 1995" | Footer pillar 1 title | ✅ Visible in footer screenshot |
| "30 years supplying Myanmar HoReCa" | Footer pillar 1 tagline | ✅ Visible in footer screenshot |
| "160+ Brands" | Footer pillar 2 title | ✅ Visible in footer screenshot |
| "Authorized distributor network" | Footer pillar 2 tagline | ✅ Visible in footer screenshot |
| "CCI France Myanmar" | Footer pillar 3 title | ✅ Visible in footer screenshot |
| "Member" | Footer pillar 3 tagline (no year — Ken to surface during gate review if confirmed) | ✅ Visible in footer screenshot |
| "Food & Beverage" | Header MegaMenu nav row, mega-panel header, "View All →" link, mobile drawer category list, Footer category column | ✅ Visible in megamenu + drawer screenshots |
| **Negative checks** | | |
| No "F & B Solutions" anywhere | Header / Drawer / Footer | ✅ Confirmed across 3 surfaces |
| No "Luxury" / "Quality" / "Reliability" pillar copy | Footer | ✅ Vague register removed from footer |
| No emoji introduced | All changed files | ✅ ripgrep clean |
| No raw hex in changed files | `Footer.tsx` | ✅ ripgrep clean (`rg '#[0-9a-fA-F]{3,8}' src/components/layout/Footer.tsx` returns nothing) |
| No `hover:scale\|hover:-translate\|hover:translate\|animate-marquee` | All changed files | ✅ ripgrep clean across `Footer.tsx`, `Index.tsx`, `MainLayout.tsx`, `ShopByBusinessType.tsx`, `FlashDealsPage.tsx`, `Contact.tsx` |
| No `WhatsAppButton` / `ClientLogos` JSX usage | `src/` | ✅ Only remaining ref is a documentation comment in `Index.tsx` describing the removal |

---

## Forbidden patterns — confirmed clean

- No new fake stats
- No new emoji
- No new decorative motion
- No new red outside locked urgency contexts (urgency-red retained only on FlashDealsPage `-{discountPct}%` badge — not changed by P6)
- No new raw hex in changed files
- All changes via semantic tokens

---

## Deferred-items closure (per P6 lock)

**Resolved this prompt:**
- Footer full re-tokenization → resolved (P6) ✓ (closes P4-deferred item)
- ClientLogos motion violation → resolved (P6) ✓
- WhatsApp floating button non-functional placeholder → resolved (P6) ✓
- F&B Solutions / Food & Beverage canonical inconsistency → resolved (P6) ✓ via DB rename
- Decorative motion in Contact / ShopByBusinessType / FlashDealsPage → resolved (P6) ✓
- Footer pillar register correction → resolved (P6) ✓

**Newly logged for Phase 2:**
- Live chat widget — dedicated Phase 2 decision (third-party widget choice, real account, palette restyle, operational coverage)

**Phase 2 still-deferred (continuing):**
About re-tokenization · Articles/ArticleDetail re-tokenization · Contact hero gradient + #25D366 green button hex · CartPage #F97316 hover hex · 6 legal route stubs · lov.json legacy tokens · editorial card image-zoom (intentionally KEPT) · New badge · /products full listing page · /flash-deals page query mismatch · /legal/terms route alias · category disambiguation parking lot · AI Gateway alpha-channel limitation

---

## Build sequence executed

1. ✅ DB migration: `categories.name` 'F & B Solutions' → 'Food & Beverage' (single transaction, reversible)
2. ✅ `categoryIcons.ts`: documented `food & beverage` as canonical, kept legacy keys for backward-compat
3. ✅ Deleted `ClientLogos.tsx`, removed mount from `Index.tsx`
4. ✅ Deleted `WhatsAppButton.tsx`, removed mount from `MainLayout.tsx`
5. ✅ Re-tokenized `Footer.tsx` (12+ raw hex → semantic tokens)
6. ✅ Replaced Footer pillar copy + icon treatment (Calendar/Award/BadgeCheck @ 20px muted)
7. ✅ Killed decorative motion: `Contact.tsx`, `ShopByBusinessType.tsx`, `FlashDealsPage.tsx`
8. ✅ ripgrep verified: zero raw hex in `Footer.tsx`, zero motion classes in changed files
9. ✅ Captured 6 acceptance gate screenshots per Rule 19 strategy
10. ✅ This README composed per Rule 18 two-column gate format

By end of P6 sign-off, the marathon's deferred-items table is the complete audit trail: ~17 items resolved across 6 prompts, ~13 items tracked for Phase 2 with explicit targets.

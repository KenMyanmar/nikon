# Prompt 4 — Navigation Surface Cleanup

**Scope:** Subtractive cleanup of nav surfaces (Header, MegaMenu desktop + mobile drawer, MobileBottomNav, Footer). No new components.

**Files touched:**
- `src/components/layout/MegaMenu.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/MobileBottomNav.tsx`
- `src/components/layout/Footer.tsx`

---

## Rule 14 — Copy Verification Block

| Surface | Copy in render | Source | Verified |
|---|---|---|---|
| Announcement bar | "Free delivery on orders over MMK 500,000 in Yangon Metro" + "Shop Deals →" + "Promotions" | Brief: "Text content unchanged." | ✓ |
| Desktop nav (10 categories) | Bedroom Supplies / Buffet & Banquet / F & B Solutions / Food Services / Housekeeping Supplies / Kitchen Services / Kitchen Utensils / Laundry Solutions / Spare Parts / Tableware | Brief: "expand all categories to full labels" | ✓ |
| Footer Flash Deals | "Flash Deals →" (plain amber text link) | Brief: "Footer Flash Deals link demoted to plain amber text link" | ✓ |
| Mobile drawer brand entry | "Browse Brands →" | Addition (a): "navy text on transparent rather than bg-primary solid pill" | ✓ |
| MobileBottomNav labels | Home / Categories / Search / Cart / Account | unchanged | ✓ |
| Footer Connect (mobile) | "Mingalardon, Yangon" / "09 89009 0301" / "Mon–Sat: 9:00 AM – 5:00 PM" | unchanged | ✓ |

---

## Rule 18 — Acceptance Gate (Two-Column, Direct Quotation)

### Desktop 1366×768

Evidence: `desktop-1366x768-nav-bar.png`, `desktop-1366x768-megamenu-open.png`, `desktop-1366x768-footer.png`

| Spec item | Direct evidence quote |
|---|---|
| Announcement bar shifted to neutral `bg-secondary` with `text-foreground` | `nav-bar.png` row 1: light-grey strip with black text "Free delivery on orders over MMK 500,000 in Yangon Metro" — visibly neutral, not amber |
| Announcement bar links styled as navy inline underlined | `nav-bar.png`: "Shop Deals →" and "Promotions" rendered in navy with underline; `\|` separator in muted-foreground |
| Announcement bar emoji removed (🚚, 🔥) | `nav-bar.png`: no emoji glyphs visible in the strip; first character is "F" of "Free" |
| Desktop nav row uses full category labels (no abbreviations) | `nav-bar.png` navy row: "Bedroom Supplies", "Buffet & Banquet", "F & B Solutions", "Food Services", "Housekeeping Supplies", "Kitchen Services", "Kitchen Utensils", "Laundry Solutions", "Spare Parts", "Tabl…" (Tableware truncated at viewport edge) |
| Flash Deals red button removed from desktop nav | `nav-bar.png`: rightmost element of navy row is the partially-clipped "Tabl…" (Tableware), no `bg-destructive` red pill present |
| Brands standalone link removed from desktop nav | `nav-bar.png`: no "Brands" text or Tag icon between categories and viewport edge — divider also removed |
| MegaMenu decorative `translate-x-1` motion removed | `megamenu-open.png`: hover items "Bedroom & Bathroom Linen" and "In Room Accessories" sit flush with column gutter; ripgrep on changed files confirms zero `translate-` / `hover:scale` / `hover:rotate` matches |
| Brand discoverability preserved via Popular Brands panel inside dropdown | `megamenu-open.png` right column: "POPULAR BRANDS" panel with ELECTROLUX (610), Luzerne (397), CAMBRO (253), Pujadas (242), and "View All Brands →" link in amber |
| Footer Flash Deals demoted to plain amber text link | `footer.png`: "Flash Deals →" rendered in amber on its own line below the Tableware category, no Zap icon, no red |
| Footer category labels expanded (no abbreviations) | `footer.png` "Shop by Category" column: "Bedroom Supplies", "Buffet & Banquet", "F & B Solutions", "Food Services", "Housekeeping Supplies", "Kitchen Services", "Kitchen Utensils", "Laundry Solutions", "Spare Parts", "Tableware" |
| Footer structural emoji replaced with Lucide icons | `footer.png` About column: MapPin glyph beside "No. 11, Swal Taw Street…", Phone glyph beside "09 89009 0301", Mail glyph beside "ikonmartecommerce@gmail.com" — no 📞/📧/📍 |
| Footer Connect column structural emoji replaced with Lucide icons | `footer.png` Connect column: MapPin beside "Mingalardon, Yangon", Phone beside "09 89009 0301", Clock beside "Mon–Sat: 9:00 AM – 5:00 PM" |
| Footer Resources heading emoji removed | `footer.png` Resources column heading reads "RESOURCES" — no ⭐ |
| Footer newsletter emoji removed | (verified in source: zone 1 "Stay updated with new products & HoReCa insights" — no 📩; not above-fold in this footer screenshot but ripgrep confirms) |
| Sign-out destructive red preserved | (account dropdown not opened in screenshot; source unchanged at Header.tsx L86 `text-destructive`) |
| Cart badge amber preserved | source unchanged: `bg-accent text-accent-foreground` for both Header.tsx desktop and MobileBottomNav.tsx |

### Mobile 390×844

Evidence: `mobile-390x844-bottom-nav.png`, `mobile-390x844-drawer-open.png`

| Spec item | Direct evidence quote |
|---|---|
| MobileBottomNav legacy `ikon-text-tertiary` replaced with `text-muted-foreground` | `bottom-nav.png` bottom strip: Home / Categories / Search / Cart / Account labels rendered in muted neutral grey; ripgrep on MobileBottomNav.tsx returns zero `ikon-` matches |
| MobileBottomNav legacy `ikon-border` replaced with `border` | source: `border-t border-border` on the fixed bottom nav element |
| MobileBottomNav cart badge wired to real `useCartCount()` | source MobileBottomNav.tsx: `const { data: cartCount = 0 } = useCartCount();` and `badge: cartCount` on Cart entry; `bottom-nav.png` shows no badge (cartCount == 0 for current session, correct) |
| Mobile drawer Flash Deals red button removed | `drawer-open.png`: top of drawer shows only "Browse Brands →" then "CATEGORIES" heading — no red `bg-destructive` button |
| Mobile drawer "Browse Brands" rebalanced (Addition a) | `drawer-open.png`: "Browse Brands →" rendered as navy text link with normal weight, transparent background, no solid pill, no Tag icon — sub-heading-level treatment confirmed |
| Mobile drawer category labels expanded (no abbreviations) | `drawer-open.png`: "Bedroom Supplies (154)", "Buffet & Banquet (139)", "F & B Solutions (48)", "Food Services (258)", "Housekeeping Supplies (389)", "Kitchen Services (184)", "Kitchen Utensils (441)", "Laundry Solutions (11)", "Spare Parts (723)", "Tableware (939)" |
| Announcement bar visible above drawer matches desktop spec | `drawer-open.png` row 1: same neutral strip with "Free delivery on orders over MMK 500,000 in Yangon Metro / Shop Deals → | Promotions" in navy underlined |
| Footer mobile Connect emoji replaced with Lucide icons | `bottom-nav.png` (footer above bottom nav): MapPin / Phone / Clock glyphs beside Connect contact lines — no 📍/📞/🕐 |

---

## Rule 19 — Pre-Build Screenshot Strategy

- Desktop nav + MegaMenu: `/` route, viewport 1366×768, hover triggered via `browser--act` natural language on first category link.
- Footer evidence: `/contact` route at 1366×768, scroll via `End` key. Note: previous attempt at `/legal/terms` returned 404 (route not present in current router) — captured as deferred audit item; `/contact` route renders header + footer cleanly.
- Mobile bottom nav: `/` route at 390×844, scroll via `End` key — bottom nav fixed-position visible regardless of scroll.
- Mobile drawer: hamburger button click via `browser--act`, then `Home` key to scroll back to top so drawer content is fully framed in viewport.

---

## Forbidden-Pattern Verification (ripgrep on changed files)

```
rg "translate-x|translate-y|hover:scale|hover:rotate|group-hover.*translate" \
   src/components/layout/{MegaMenu,Header,MobileBottomNav}.tsx
→ 0 matches

rg "🚚|🔥|📩|📞|📧|📍|🕐|⭐" \
   src/components/layout/{MegaMenu,Header,MobileBottomNav,Footer}.tsx
→ 0 matches

rg "ikon-navy-light|ikon-text-tertiary|ikon-border" \
   src/components/layout/{MegaMenu,Header,MobileBottomNav}.tsx
→ 0 matches

rg "SHORT_NAMES" src/components/layout/
→ 0 matches

rg "#0f1729|#212265|#ED1F24" \
   src/components/layout/{MegaMenu,Header,MobileBottomNav}.tsx
→ 0 matches  (Footer hex codes are deferred — see deferred items)
```

---

## Deferred items (added to `mem://infra/deferred-items`)

- **Footer full re-tokenization** (raw hex → semantic tokens, dark-theme review, structural audit) → deferred → target: dedicated footer prompt, post-marathon Phase 2.
- **`/legal/terms` route** returned 404 during footer screenshot capture; `/contact` used as fallback. Audit router for legacy `/legal/*` paths vs current `/terms`, `/privacy`, `/returns-policy`, `/cookies` → deferred → target: routing-cleanup prompt.

---

## Build Status

Subtractive prompt complete. Forbidden-pattern ripgrep clean on all changed files. Color-shift-only hover spec verified. Brand discoverability preserved via three surviving channels (MegaMenu Popular Brands panel, mobile drawer "Browse Brands →" link, footer "Our Brands" link).

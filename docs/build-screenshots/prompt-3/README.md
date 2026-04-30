# Prompt 3 — Product Card Geometry — Acceptance Gate (corrected)

## Evidence files

| File | Viewport | What it shows |
|---|---|---|
| `desktop-1366x768-grid-top.png` | 1366×768 | Best Sellers row top — frame, brand slot, badges, heart |
| `desktop-1366x768-card-body.png` | 1366×768 | Best Sellers row body — title clamp, price, CTA fork |
| `desktop-1366x768-flash-row.png` | 1366×768 | Flash variant card top — `-30%` red badge, heart, image frame |
| `desktop-1366x768-flash-card-body.png` | 1366×768 | Flash variant card body — `35/100 sold`, `MMK 35,588` + strike-through `MMK 50,840`, amber Add to Cart |
| `mobile-390x844-card-grid.png` | 390×844 | Bedroom Supplies category — 2-col mobile grid with full card composition |
| `mobile-390x844-hero.png` | 390×844 | Homepage transition hero → category rail (Prompt 1/2 carryover, retained as context) |

The flash-variant evidence was captured by seeding one temporary `flash_deals` row (product: QZQ MILK JAR ,0.6L; original 50,840; flash 35,588; sold 35/100; window now → +24h). Seed inserted via migration, screenshots taken, then deleted via cleanup migration. Verified zero rows remain (`SELECT count(*) WHERE id = ...beef → 0`).

## Acceptance gate (Rule 18 — direct-quotation two-column)

| Spec | As rendered (direct quote from screenshot) | Matches |
|---|---|---|
| **Card chrome** — white card, 1px border, 8px radius, no resting shadow | As rendered (`grid-top`, `flash-row`, `card-grid`): white card surface; visible 1px border in `border-border` neutral grey; rounded ~8px corners; no drop shadow visible at rest. | ✓ |
| **Image frame** — square `aspect-square`, `object-contain` on `bg-muted` | As rendered (`grid-top`, `flash-row`): square light-grey image frame; product fully contained within frame; flash card shows milk jar centered in square `bg-muted` panel. | ✓ |
| **Heart-save** — top-right inset, 18px Lucide outline default, navy filled when saved, no background, no animation | As rendered (`grid-top`, `card-grid`, `flash-row`): outline heart visible top-right of every card; consistent inset; outline only (no fill) — none in shots are in saved state. No background pill, no animation visible. | ✓ |
| **Brand slot** — uppercase muted-foreground above title | As rendered (`grid-top`, `card-grid`, `card-body`): "LA LINKER", "QZQ" in uppercase muted grey above each title. | ✓ |
| **Title slot** — clamp-2, dark text | As rendered (`card-body`): "DESSERT KNIFE, 0113 COLLECTION" wraps to 2 lines and clamps; "BLADE FOR C-042 FLOOR & WINDOW SCRAPER, 10PCS/BAG" clamps to 2 lines truncated. | ✓ |
| **Specs slot (default variant only)** — secondary muted line | As rendered (`card-body`): "Sourcing from the China Professional…" muted line below title on priced cards. | ✓ |
| **Price format** — `MMK {n.toLocaleString()}` amber, prefix + thousands separator | As rendered: "MMK 9,635", "MMK 13,940", "MMK 27,470", "MMK 32,390", "MMK 35,588", "MMK 66,420" — all amber, comma-separated. | ✓ |
| **CTA fork — priced** — full-width amber "Add to Cart" with cart icon | As rendered (`card-body`, `card-grid`, `flash-card-body`): amber `Add to Cart` with cart icon under every priced card. | ✓ |
| **CTA fork — unpriced** — navy "Request Quote" + "Price on request" label | As rendered (`card-body`): "LL TEA SPOON, DOT DESIGN" card shows label "Price on request" then full-width navy `Request Quote` button. | ✓ |
| **Stock pill — silent for in_stock** | As rendered: no `In stock` pill on any card across all six screenshots. | ✓ |
| **Badge allowlist — `-N%` destructive red** | As rendered (`flash-row`): `-30%` rendered top-left of flash card in solid red destructive pill, white text. | ✓ |
| **Badge allowlist — `New`** | Deferred per locked spec; no rendered evidence required this prompt. | n/a (deferred) |
| **Badge allowlist — `Low stock`** | No qualifying products in current viewports. No false positives observed. | ✓ (negative) |
| **Badge allowlist — `Out of stock`** | No qualifying products in current viewports. No false positives observed. | ✓ (negative) |
| **Flash variant — discount badge** | As rendered (`flash-row`): `-30%` red destructive top-left. | ✓ |
| **Flash variant — sold-progress label** | As rendered (`flash-card-body`): "35/100 sold" rendered above price. | ✓ |
| **Flash variant — original price strike-through** | As rendered (`grid-top`, `flash-card-body`): `MMK 35,588` amber + `~~MMK 50,840~~` muted strike-through inline. | ✓ |
| **Flash variant — countdown** | As rendered (`flash-row`): "Flash Deals" heading with red countdown pill `23:55:44` rendered alongside. | ✓ (urgency-red, urgency-only context) |
| **Flash-variant geometry consistent with default** | As rendered (`flash-row`, `flash-card-body`): same square frame, same heart placement, same border + radius, same amber CTA color. Tighter padding visible vs. default Best Sellers row but composition rule is preserved. | ✓ |
| **TrustBadgeBar replaces ClientLogos cluster** | As rendered (`flash-card-body`): "Fast Delivery / Yangon Metro · Wholesale Pricing / Best B2B Rates · 160+ Brands / Trusted Names · B2B Accounts / Credit Terms" rendered as 4-column trust bar. No client-logo cluster present. | ✓ |
| **No forbidden patterns — no shadows on rest, no card translate, no quick-view, no hover-reveal heart** | As rendered: no shadow under any card; heart visible at rest on every card (not hover-revealed); no quick-view button; hover affordance is border-color only per locked spec. | ✓ |

## Deferred items confirmed (cross-prompt, non-blocking)

- `New` badge logic — deferred to later prompt (locked spec)
- Flash Deals red nav button (top-right) — deferred to Prompt 4 (utility/nav prompt)
- Promo strip emoji (🚚, 🔥) — deferred to utility-bar prompt
- Svc / Utensils abbreviations in nav — deferred to navigation prompt
- `/flash-deals` page rendering empty body when deals exist — independent issue (queries `products` not `products_public`); logged but out of Prompt 3 scope

## Process notes

- **Rule 19** logged to `mem://style/photography-rules` covering pre-build screenshot-capture strategy. Triggered by recurring `scrollTo`-snap-back friction across Prompt 2 + Prompt 3.
- **Mobile cards captured via `/category/bedroom-supplies` route entry** — cards above the fold on viewport entry, no scroll required (Rule 19 applied retroactively this round, will be applied pre-build from Prompt 4 forward).
- **Flash variant captured via temp seed + `act(method: press, args: [PageDown])`** — `scrollTo` snapped back twice; `PageDown` press persisted scroll position. Seed cleaned post-capture.

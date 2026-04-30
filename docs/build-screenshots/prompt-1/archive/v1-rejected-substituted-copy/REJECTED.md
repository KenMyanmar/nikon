# v1 Rejected — Substituted Copy

These screenshots were rejected at the Prompt 1 acceptance gate. The
production `Hero.tsx` shipped with copy and CTAs carried over from the
retired `HeroSection.tsx` instead of the locked Prompt 1 spec — the same
substitution mechanism that was caught and rejected at v3 mockup stage.

## Violations

1. **Substituted headline**:
   - Rendered: "Myanmar's Trusted Marketplace for Kitchen, Hotel, Restaurant & Commercial Supplies"
   - Spec:     "Myanmar's procurement platform for hotels, restaurants, and cafes"

2. **Substituted subhead**:
   - Rendered: "4,000+ products from 160+ premium international brands. Trade pricing, bulk quotes, and verified stock — built for HoReCa procurement."
   - Spec:     "Stocked. Sourced. Delivered."

3. **Three CTAs instead of two**:
   - Rendered: "Browse Catalogue" + "Request a Quote" + "Wholesale Signup"
   - Spec:     "Browse Products" (→ /products) + "Open Wholesale Account" (→ /wholesale-signup)

4. **Embedded search input**: Hero contained an in-section
   `SearchAutocomplete`, duplicating the header search above the fold.
   Not in spec.

5. **Desktop headline broke to 4 visual lines**, not the v5 mockup's 3.

## Cause

Mockup-level Rule 14 was applied to the v5 render. The production
component build referenced existing in-repo source (`HeroSection.tsx`)
rather than the prompt spec. Rule 14 has been revised to cover all
text-introducing commits, and Rule 18 added to require direct quotation
from screenshots in acceptance-gate resulting-state columns.

Replaced by `../desktop-1366x768.png` and `../mobile-390x844.png`.

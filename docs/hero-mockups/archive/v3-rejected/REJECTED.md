# REJECTED — v3

## Reason
Substituted copy. The render used strings carried over from the in-repo
`src/components/home/HeroSection.tsx` (lines 38–43 and 12–13) instead of the
locked Prompt 1 brief copy. The four-check audit run on these PNGs is therefore
partially invalid: locked copy has different line breaks, different vertical
footprint, and different CTA widths, all of which affect contrast pad sizing
and corridor headroom on mobile.

## What was rendered (rejected)
- Headline: "Myanmar's Trusted Marketplace for / Kitchen, Hotel, Restaurant & / Commercial Supplies"
- Subhead:  "4,000+ products from 160+ premium international brands"
- CTAs:     "Shop Categories" + "Request a Quote"

## What should have been rendered (locked Prompt 1)
- Headline: "Myanmar's procurement platform for hotels, restaurants, and cafes"
- Subhead:  "Stocked. Sourced. Delivered."
- CTAs:     "Browse Products" + "Open Wholesale Account"

## Replacement
v4 — see `../../v4-desktop.png` and `../../v4-mobile.png`.

## Rule established as a result
Rule 14 (locked-copy verification before render). See `mem://style/photography-rules`.

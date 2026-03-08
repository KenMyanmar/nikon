

# Product Detail Page — Visual Polish + Image Zoom

## What needs to change

The current page is functional but lacks the visual refinement of the reference: no star rating, flat bulk pricing list, inline CTAs instead of full-width, no payment icons, no image zoom, and stock count hidden for most products.

## Changes to `src/pages/ProductDetail.tsx`

### A. Image Zoom on Hover (main image)
- Track mouse position on the main image container via `onMouseMove`
- On hover, apply `transform: scale(2.5)` with `transform-origin` set to mouse coordinates
- Container gets `overflow-hidden cursor-crosshair`
- On mouse leave, reset to normal scale
- State: `isZooming: boolean`, `zoomPosition: {x, y}`

### B. Star Rating Row
- Below the title, add a row of 5 `Star` icons (empty/outline) + "0 reviews" text link
- Clicking scrolls to the reviews tab and activates it

### C. Show Stock Quantity Always
- Change the stock badge to show "In Stock - {count}" when `onhand_qty` is available (not just when ≤10)

### D. Visual Bulk Pricing Tier Cards
- Replace the flat grid list with horizontal bordered cards
- Each card: light background, border, shows qty range on top + price below
- Active tier (based on current `qty`) gets a primary-colored border highlight
- Header text: "Buy more and save"

### E. Full-Width CTA Buttons
- "Add to Cart →" becomes full-width with gradient background (`bg-gradient-to-r from-accent to-accent/80`)
- "Request Quote" becomes full-width outline button below it
- Quantity selector sits above both buttons on its own row

### F. Payment Icons Strip
- Below CTAs, add a row: "We Accept:" followed by text badges/pills for KBZ Bank, KBZ Pay, AYA Pay, MPU, CBPay
- Styled as small bordered pills with subtle background

### G. Trust Signals Redesign
- Keep the ships/trusted row but add a subtle top border to separate it visually

## Files Changed
| File | Action |
|------|--------|
| `src/pages/ProductDetail.tsx` | All changes above — zoom, rating, tier cards, full-width CTAs, payment strip |


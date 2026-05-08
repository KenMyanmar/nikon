## Diagnosis — why it doesn't look like the reference

I compared the live render side-by-side with the reference and the gap is **not** about colors, sizes, or shape detail. It's a **layout topology mistake**.

### What the reference actually shows

```text
[ HOME  ABOUT US  E-SHOP  OUR SERVICES  ARTICLES  CONTACT US  OUR PRODUCTS   IKON-BADGE   ♡ 🛒 🔔   [ search ]   👤 ] ← single white row
[ Bedroom Supplies  Buffet & Banquet  F&B Solutions  Food Services …                                                ] ← navy bar (uninterrupted)
```

- The IKON badge **lives inside the white row**, sitting between the text links and the icons — it is **not** centered on the page.
- The badge's curved skirt **dips ~10px into the navy bar**, but the navy bar's category labels start to the **right** of the badge. The badge does not float over the middle of the category bar.
- Total = a single tall horizontal band of content, with the navy bar starting clean below it.

### What we currently render

- Badge is `position: absolute; left: 50%; -translate-x-1/2` on the **navy bar**, sitting on the seam. That centers it on the **viewport**, where it lands on top of "Bedroom Supplies / Buffet & Banquet" and visually breaks the category bar.
- Utility links are flush-left, icons + search are flush-right, and the badge floats in the dead center over the navy bar — so the white row looks empty in the middle and the navy bar looks chopped in half.

That's why every iteration so far has felt "close but wrong" — we've been polishing a layout that doesn't match the reference's structure.

### The fix (Version A.5 — layout topology correction)

Single file: `src/components/layout/Header.tsx`.

1. **Stop centering the badge on the viewport.** Remove the absolute-positioned badge over the navy bar.
2. **Move the badge into the utility row's flex flow**, between the left links group and the right action group:
   ```text
   <utility-row flex items-center>
     [ HOME … CONTACT US ]   ← left group
     [ IKON-BADGE ]          ← inline, NOT absolute, NOT centered
     <ml-auto />             ← pushes the right group to the edge
     [ ♡ 🛒 search 👤 ]      ← right group
   </utility-row>
   ```
   Specifically: the left links group keeps its current position; the badge becomes the next sibling with `mx-6` (or sits inside an inline-block); the right action group keeps `ml-auto`. This guarantees the badge sits **after the links** and **before the icons**, exactly like the reference.
3. **Allow the skirt to overflow into the navy bar** without breaking flow:
   - Utility row keeps `h-[48px]` but the badge wrapper is taller (`h-[64px]`) and uses `-mb-4` (or `translate-y-2`) to dip below the row.
   - The parent `header` already stacks utility row → navy bar, so the overflow naturally lands on top of the navy bar's left edge area — but because the badge is now positioned *within* the white-row content flow (after the left links), it lands on the **left portion** of the navy bar, not the center. That matches the reference.
4. **Tighten the utility row** so the 4 approved links sit close together at the left (ref shows 7 links tightly packed; we have 4, so we use slightly tighter `gap-5` and let the badge follow immediately after to fill the visual weight the missing 3 links would have provided).
5. **Navy bar stays untouched** — no absolute overlay, no cutout, categories render uninterrupted from the left edge. This also fixes the bug where "Bedroom Supplies" was being hidden behind the badge.
6. **Keep all current Version A.4 styling** (SVG shape, sizes, search unit, icons, hidden announcement on desktop) — only the badge's positioning model changes.

### What this does NOT change

- Menu names, order, routes — locked.
- Category names, order, links, hover behavior — locked. The navy bar is now visually cleaner because we stop overlapping it.
- Mobile structure — untouched.
- Search behavior — untouched.

### Verification

- Screenshot at 1366×768, header + ~80px hero.
- Confirm: badge sits left-of-center, categories visible end-to-end with no occlusion, single visual band reads top-to-bottom like the reference.
- Confirm `MegaMenu.tsx` untouched in this pass.

### Honest note

After this topology fix, the remaining gap to the reference will be cosmetic only (exact badge silhouette curvature, tracking on the wordmark). Those are quick polish iterations once the structure is right.

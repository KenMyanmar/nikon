## Why preview differs from your real browser

The recent header rebuilds gated the desktop layout behind Tailwind's `lg` breakpoint = **1024px**. Your Lovable preview pane is **866px wide**, which is below 1024px, so it falls into the **mobile** branch. Your laptop browser is ~1920px, so it renders the **desktop** branch. Same code, two different layouts based on width.

Earlier versions used `md` (768px), which is why preview used to match your browser at this width.

## Fix

Switch the desktop/mobile gate from `lg:` → `md:` in two files. After this, any viewport ≥768px (including the 866px preview pane) shows the full desktop header you see on `ucogold.com`. Real phones (<768px) still get the mobile header.

### File: `src/components/layout/Header.tsx`

- Line 54 — announcement bar: `lg:hidden` → `md:hidden`
- Line 60 — desktop utility row wrapper: `hidden lg:block` → `hidden md:block`
- Line 179 — desktop category bar wrapper: `hidden lg:block` → `hidden md:block`
- Line 184 — mobile header wrapper: `lg:hidden` → `md:hidden`

### File: `src/components/layout/MegaMenu.tsx`

- Line 209 — desktop mega nav: `hidden lg:block` → `hidden md:block`

### Verification after change

- Preview at 866px should show: utility links (HOME · ABOUT US · ARTICLES · CONTACT US) on the left, navy logo tab in center, search + icons on the right, navy category bar below — identical to ucogold.com.
- A real phone (~390px) should still show the hamburger + small logo + mobile search row (mobile branch unchanged in structure).
- Tablet range 768–1023px will now use the desktop header. The mega nav has many categories (Tableware, Kitchen Utensils, etc.) — at 866px they may wrap or feel tight. If that's an issue we'll do a tighter spacing pass as a follow-up, but the layout will be the correct desktop one.

## Out of scope

- No changes to header structure, menu labels, menu order, category labels/order, routes, or business logic.
- No changes to the mobile header internals.
- No design token changes.

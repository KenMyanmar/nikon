## Contact Page Redesign — Match Mockup Exactly

Goal: Rework `src/pages/Contact.tsx` so the visual hierarchy, density, and color accents match the attached mockup. No DB or routing changes — purely a frontend redesign of the existing page.

### What's removed
- Entire "Chat with IKON Sales Team" block (the WhatsApp / Viber / Messenger / WeChat / Chat / SfiveChat 3×2 grid).
- The `CHANNELS` constant and its imports become unused — delete.
- The hero buttons keep their labels but become anchor scrolls only (no chat hrefs).

### Section 1 — Hero (visual upgrade)
- Full-bleed commercial kitchen photo as background (keep current Unsplash kitchen image — it is already a real photo; just lighten the overlay).
- Replace heavy `from-[#1B3A5C]/90 to-[#0f1729]/85` with subtler gradient: `from-[#0f1729]/75 via-[#1B3A5C]/55 to-transparent` going left→right, so the kitchen is clearly visible on the right side.
- Container becomes left-aligned (`text-left`), max-w-3xl, removed `mx-auto` on inner text.
- Title `Contact IKON Mart` — `text-4xl md:text-6xl font-bold text-white`.
- Subtitle in `text-white/80`, max-w-xl.
- Three pill buttons in a row, all anchor-scroll only:
  - **Call Us** → `#contact-info`, blue (`bg-primary`), Phone icon.
  - **WhatsApp / Viber** → `#contact-info`, green (`bg-[#25D366] hover:bg-[#1ebe57]`), MessageCircle icon.
  - **Send Inquiry** → `#inquiry`, blue (`bg-primary`), Send icon.
- Reduced vertical padding: `py-16 md:py-24`.

### Section 2 — Contact Info Cards (key visual fix)
- Layout: 2-col grid on `md+`, single col on mobile. Four cards, in this order: Call Us, Email, Visit Our Office, Business Hours.
- Per-card structure to match mockup density:
  ```text
  ┌──┬─────────────────────────────────────┐
  │██│ [● icon]  CALL US (color-accent label)
  │██│ 01-8650230
  │██│ 01-8650231
  │██│ ───────────────────────────────────
  │██│ Chat with Sales Team  ›
  └──┴─────────────────────────────────────┘
  ```
- Left border: `border-l-4` in card's accent color.
- Icon badge: solid filled circle `w-11 h-11 rounded-full` with white icon inside. Backgrounds use full color (not /10 tint):
  - Call Us → `bg-primary` (blue) + `border-l-primary`, label `text-primary`.
  - Email → `bg-amber-500` + `border-l-amber-500`, label `text-amber-600`.
  - Visit Our Office → `bg-emerald-600` + `border-l-emerald-600`, label `text-emerald-700`.
  - Business Hours → `bg-amber-400` + `border-l-amber-400`, label `text-amber-600`.
- Label is uppercase, `text-xs font-bold tracking-wide` in accent color (e.g. "CALL US", "EMAIL").
- Info text directly below in `text-foreground font-medium` (tight spacing, not `text-muted-foreground`).
- "Chat with Sales Team →" action link only on Call Us and Email cards, separated by a `border-t border-border/60 mt-3 pt-3`.
- Reduced padding: `p-5` (not `p-6`) for compactness; `gap-4` between cards.

### Section 3 — Map + Inquiry Form (side by side)
- Two-column grid (`lg:grid-cols-2`), white section background (`bg-card`, alternates from cards above which become `bg-ikon-bg-secondary`).
- **Left column**: existing Google Maps iframe in a `rounded-card shadow-card` wrapper. Below the iframe, prominent "Get Directions" button styled as a solid `bg-primary text-primary-foreground rounded-button` button (not a text link).
- **Right column**: Inquiry form, same fields and zod schema as today, but visual cleanup:
  - White card `bg-card rounded-card shadow-card p-6`.
  - Heading "Send Us an Inquiry" `text-2xl font-bold`.
  - Form fields: keep current 2-col grid for name/company/phone/email; ensure `space-y-4` rhythm.
  - Business Type stays as selectable pill chips (current implementation already correct).
  - Inquiry Type rendered as checkbox rows with a green/blue check icon when on (keep checkbox, just style accent green via `accent-emerald-600`).
  - Submit button: full-width, `bg-primary` with right-chevron (Send icon kept), label "Send Inquiry ›".
- The big `#chat` block and `CHANNELS` map are removed entirely from this section.

### Section 4 — Why Contact IKON Mart?
- No structural changes. Keep current implementation.

### Section 5 — Contact by Department
- Keep grid; tighten card style to mimic mockup:
  - `flex items-center gap-3 p-4` (slightly smaller).
  - Icon in a small rounded square `w-9 h-9 rounded-md bg-primary/10 text-primary`.
  - Right `ChevronRight` in `text-muted-foreground`.
  - Hover: `hover:bg-card hover:shadow-card-hover hover:-translate-y-0.5 transition`.

### Files affected
- `src/pages/Contact.tsx` — single-file rewrite of the JSX. No new files. No route changes. No DB changes.

### Out of scope
- No changes to `App.tsx`, no new components, no new migrations.
- No edits to global tokens — all accent colors used (`amber-500`, `emerald-600`, `primary`) are already available via Tailwind defaults / project tokens.

# Contact Us Page — Implementation Plan

Build a professional `/contact` page matching the supplied mockup, using `MainLayout` and the site's existing tokens (`bg-card`, `rounded-card`, `shadow-card`, `bg-primary`, `bg-ikon-bg-secondary`).

## 1. Database (Supabase migration)

Create table `public.contact_inquiries`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | not null |
| `company` | `text` | nullable |
| `phone` | `text` | nullable |
| `email` | `text` | not null |
| `business_type` | `text[]` | default `'{}'` |
| `inquiry_type` | `text[]` | default `'{}'` |
| `message` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |

RLS: enabled. Policy — `INSERT` allowed for `anon` and `authenticated` (public contact form). No `SELECT` policy (admins read via dashboard / future role).

## 2. New page: `src/pages/Contact.tsx`

Wrapped in `MainLayout`. Sections:

### Section 1 — Hero
- Full-width banner, dark navy gradient overlay (`bg-gradient-to-r from-[#1B3A5C]/90 to-[#0f1729]/85`) on top of an Unsplash kitchen image (`https://images.unsplash.com/photo-1556909114-f6e7ad7d3136`).
- White centered heading "Contact IKON Mart" + subtitle.
- 3 anchor pill buttons (`rounded-full bg-primary text-primary-foreground`) — Call Us (`Phone`), WhatsApp / Viber (`MessageCircle`), Send Inquiry (`Mail`) — each smooth-scrolls to `#call`, `#chat`, `#inquiry`.

### Section 2 — Contact Info Cards
- 2×2 grid (desktop) / 1-col (mobile), `bg-card rounded-card shadow-card p-6`, colored left border (`border-l-4`) per card:
  - Phone (blue): 01-8650230 / 01-8650231 → "Chat with Sales Team" link to `#chat`
  - Mail (red): webadmin@ikonmart.com → "Chat with Sales Team" link
  - MapPin (green): No.11 Swal Taw Street, Mingalardon Township, Yangon
  - Clock (amber): Mon – Sat, 9:00 AM – 5:00 PM
- Each card has a colored circular icon badge.
- Section anchor `id="call"`.

### Section 3 — Chat + Form (anchor `id="chat"` / `id="inquiry"`)
Two-column grid (`lg:grid-cols-2`), stacks on mobile.

**Left — "Chat with IKON Sales Team"**
- 3×2 button grid of channels with brand colors:
  - WhatsApp (green) → `https://wa.me/959890090301`
  - Viber (purple) → `viber://chat?number=959890090301`
  - Messenger (blue) → IKON FB Messenger link
  - WeChat (green)
  - Chat (links to WhatsApp)
  - SfiveChat (blue)
- Each button: icon + label + small `ChevronDown`. External links use `target="_blank" rel="noopener"`.
- Below: same Google Maps iframe used in `About.tsx`, plus "Get Directions" button (links to Google Maps).

**Right — "Send Us an Inquiry" form**
- Fields: Name, Company / Hotel, Phone / WhatsApp, Email.
- Business Type — toggleable chips (multi-select): Restaurant, Hotel, Cafe, Catering.
- Inquiry Type — checkboxes: Equipment purchase, Maintenance service, Kitchen project, General inquiry.
- Optional Message textarea.
- Submit button (`bg-primary` full width).
- Validation via `zod` (name required, email valid, lengths capped at 100/255/1000).
- Submit → `supabase.from("contact_inquiries").insert(...)` → success toast (sonner), reset form. Error → error toast.

### Section 4 — "Why Contact IKON Mart?"
- Two-column with `bg-ikon-bg-secondary`. Left: heading + 4 bullet points with green `Check` icons. Right: kitchen Unsplash image with `rounded-card`.

### Section 5 — Contact by Department
- `id="departments"`. Heading + 2-col grid (1-col on mobile) of mailto cards: Sales, Projects, Service, Spares, E-commerce. Each `<a href="mailto:…">` with department icon, label, email, right-side `ChevronRight`. Hover `shadow-card-hover`.

### Section 6 — Mobile responsiveness
Achieved via Tailwind: `grid-cols-1 md:grid-cols-2 lg:grid-cols-2`, hero text scales `text-3xl md:text-5xl`, chat/form stack on `<lg`.

## 3. Routing & Nav
- `src/App.tsx`: import `Contact`, register `<Route path="/contact" element={<Contact />} />` above the `*` catch-all.
- Header has no Contact link currently; existing `/contact` references in `About.tsx` will resolve correctly. (No header changes required.)

## 4. Files

**Created**
- `src/pages/Contact.tsx`
- Supabase migration for `contact_inquiries` table + RLS insert policy.

**Modified**
- `src/App.tsx` — register `/contact` route.

## Technical notes
- Smooth scroll: small `useEffect` reading `location.hash` (pattern from `About.tsx`).
- Form state: local `useState`, no react-hook-form needed (keeps bundle small, matches simplicity).
- Use `toast` from `sonner`.
- All external chat links open in new tab; `tel:` and `mailto:` use default behavior.
- No service_role usage; insert relies on the public RLS insert policy.

# Genericize Storefront — Template v1.0 (revised)

Convert this storefront from "IKON Mart" into a neutral Myanmar HoReCa B2B template. Product/brand/category catalogs and all backend infrastructure stay; only the storefront identity changes.

Revision notes from review: Section 7 moved out of Lovable scope (schema change, user runs manually); STOREFRONT_HOSTS gets a defensive fallback; email-template scrub added as Section 11; favicon swap added; template-version constant + TEMPLATE.md added.

## 1. Tokenization convention

Every customer-facing IKON string becomes a literal placeholder sourced from a new `src/config/brand.ts`:

```ts
export const BRAND = {
  name: "{BRAND_NAME}",
  address: "{ADDRESS}",
  phone: "{PHONE}",
  email: "{EMAIL}",
  socials: {
    facebook: "{FACEBOOK_URL}",
    instagram: "{INSTAGRAM_URL}",
    messenger: "{MESSENGER_URL}",
  },
  trustPillars: ["{TRUST_PILLAR_1}", "{TRUST_PILLAR_2}", "{TRUST_PILLAR_3}"] as const,
} as const;

export const TEMPLATE = {
  version: "1.0",
  family: "myanmar-horeca-b2b",
} as const;
```

All UI imports from this one file so swapping for a real client is a single edit.

## 2. Replace the logo and favicon

- Generate `src/assets/brand-logo-placeholder.svg` — 200×60, rounded `#F1F1F1` background with centered "YOUR LOGO" text in neutral grey.
- Generate `public/favicon.svg` — neutral grey rounded square (32×32). Update `index.html` `<link rel="icon">` to point at `/favicon.svg` and delete `public/favicon.ico` if present. Leave `public/favicon.png` in place but the link no longer references it (per-client favicon is provided per deployment).
- Replace `ikonMartLogo` import in `src/components/layout/Header.tsx` (desktop hump + mobile `<img>`).
- Replace `ikonLogo` imports in `src/components/auth/AuthModal.tsx` and `src/pages/ResetPassword.tsx`.
- Leave unused `src/assets/ikon-logo.png` / `ikon-mart-logo.png` in place (harmless; flagged for optional cleanup).

## 3. UI text scrub (text-only, no logic changes)

| File | Change |
|---|---|
| `index.html` | `<title>`, `og:title`, `twitter:title`, `og:description`, meta description → templated with `{BRAND_NAME}`. Remove the published-preview `og:image`. Favicon link → `/favicon.svg`. |
| `src/components/layout/Header.tsx` | Logo swap; `alt`/`aria-label` → `BRAND.name`. |
| `src/components/layout/Footer.tsx` | Socials → `BRAND.socials.*`; address/phone/email rows (190/194/198/254/257/274/278/282/316/319) → `BRAND.address|phone|email`; pillars (52–54) → `BRAND.trustPillars` with neutral Lucide icons (`Star`/`Star`/`Star` or similar non-claim icons); "Since 1995" tagline (373) → "Myanmar's procurement platform for hotels, restaurants, and cafes"; CCI line removed; newsletter mailto → `BRAND.email`. |
| `src/components/home/HeroBannerCarousel.tsx` | `STOREFRONT_HOSTS` → `["localhost", "*"]` (defensive wildcard so the carousel still renders on any host instead of going blank). |
| `src/components/home/QuoteCTA.tsx` | "09 89009 0301" → `${BRAND.phone}`. |
| `src/components/home/TrustBadgeBar.tsx` | "160+ Brands / Trusted Names" → generic placeholder copy. |
| `src/components/home/BrandCarousel.tsx` | "Authorized distributor of 160+ premium international brands" → generic sub-headline. |
| `src/components/auth/AuthModal.tsx` | Toast + welcome copy → `BRAND.name`. |
| `src/pages/ResetPassword.tsx` | "IKON Mart account" → `${BRAND.name} account`. |
| `src/pages/ProductDetail.tsx` line 1059 | "IKON Mart replied:" → `${BRAND.name} replied:`. |
| `src/pages/RequestQuotePage.tsx` line 766 | "IKON Mart's" → `${BRAND.name}'s`. |
| `src/pages/ServiceDetailPage.tsx` | `document.title` / og tags → `BRAND.name`. |
| `src/pages/ServicesPage.tsx` | TITLE constant → `BRAND.name`. |
| `src/pages/BusinessTypeLandingPage.tsx` | Canonical `https://ucogold.com/...` → relative path; title `IKON Mart Myanmar` → `BRAND.name`. |

## 4. About page rewrite (`src/pages/About.tsx`)

Replace the body with three short sections, all driven by BRAND constants:

1. **Our Story** — single paragraph: "About {BRAND_NAME} — your Myanmar B2B procurement partner. [Add your story here.]"
2. **Our Promise** — three bullets: `{PROMISE_1}` / `{PROMISE_2}` / `{PROMISE_3}`.
3. **Get in Touch** — `BRAND.address`, `BRAND.phone`, `BRAND.email`, single CTA to `/contact`.

Remove: 1995 milestone, all hotel-project entries (Strand/Kempinski/Novotel), showroom photo card, careers mailto, CCI France footer.

## 5. Contact page rewrite (`src/pages/Contact.tsx`)

- Department emails (Sales/Projects/Service/Spares + webadmin) → single `BRAND.email` row.
- Address lines → `BRAND.address`.
- Google Maps iframe + "Open in Maps" link → removed.
- "Contact IKON Mart" / "Why Contact IKON Mart?" → "Contact {BRAND_NAME}" / "Why Contact {BRAND_NAME}?".

## 6. Database data scrub (insert tool — UPDATE only)

```sql
UPDATE public.articles      SET status    = 'archived' WHERE status <> 'archived';
UPDATE public.client_logos  SET is_active = false      WHERE is_active = true;
UPDATE public.banners       SET is_active = false      WHERE is_active = true;
```

## 7. Out of scope — user runs manually

The order-number trigger `generate_order_number()` mints `IKON-YYYY-NNNNN`. Changing it is a function definition (schema-level), not a data update. **The user will run this manually in the Supabase SQL editor after the Lovable scrub finishes** — Lovable does not touch it in this prompt. Suggested SQL (for the user's reference, not for Lovable to run):

```sql
CREATE OR REPLACE FUNCTION public.generate_order_number() ...
  -- replace 'IKON-' with 'ORD-' in both BEFORE-INSERT trigger bodies
```

## 8. Template tokens that stay (do not rename)

- Tailwind tokens `text-ikon-*`, `bg-ikon-*`, `border-ikon-*` in `tailwind.config.ts` and ~6 component files. Internal class names, invisible to end users. Documented as "legacy token prefix; treat as opaque" in TEMPLATE.md.
- `supabase/migrations/` history — never edited.
- `docs/build-screenshots/` audit trail — never edited.
- Product `long_description` copy that mentions "IKON account manager" inside CMS content — lives in the `products` table as authored text; the new client will overwrite during catalog onboarding. Out of scope for code.

## 9. Verification

After build:

```bash
rg -i 'ikon mart|ikonmart|ucogold|mingalardon|kempinski|novotel|cci france|89009 0301|since 1995|160\+ brands' \
   --glob '!supabase/migrations/**' --glob '!docs/build-screenshots/**' \
   --glob '!src/config/brand.ts' src/ index.html public/
```

Expected: zero matches. Screenshots at 1366×768 and 390×844 of Home, About, Contact, Footer, one Category, one Product detail — all showing `{TOKEN}` placeholders where IKON copy used to be.

## 10. Versioning artifact (closes the open question)

- Code: `TEMPLATE` constant in `src/config/brand.ts` (see §1).
- Repo root: new `TEMPLATE.md` with version, intended use case, full `{TOKEN}` checklist, "where to edit per section" guide, and a changelog seeded with `v1.0 — Initial genericization from IKON Mart storefront`.
- Git tagging happens outside Lovable.

## 11. Email + communication template scrub

`send-order-email` Edge Function and any rows in `communication_templates` likely contain "Thank you for shopping with IKON Mart" or similar literals. Without scrubbing, the new client's first order confirmation goes out signed by IKON Mart.

Steps:

1. Read `supabase/functions/send-order-email/index.ts` — replace every literal brand reference (subject lines, salutations, signatures, footer, reply-to) with `BRAND_NAME` sourced from `Deno.env.get('BRAND_NAME')` with a `"{BRAND_NAME}"` literal fallback. No hard-coded "IKON" anywhere in the function body.
2. Query `communication_templates` for rows whose `subject` or `body` matches `%IKON%` / `%ikonmart%` / `%ucogold%` / `%Mingalardon%`. Replace those substrings with the literal token `{BRAND_NAME}` / `{EMAIL}` / `{PHONE}` / `{ADDRESS}` via UPDATE statements (insert tool). Templates render the tokens as literals until a client populates them — that is the desired template-mode behavior.
3. Same rule applies to any future SMS templates; not in scope today but documented in TEMPLATE.md.

## 12. Out of scope (CRM repo)

This is storefront-only. The CRM (`ikoncrm`) still carries IKON branding on the login screen, sidebar, page titles, and staff invite emails. A parallel CRM scrub prompt is needed — same tokenization convention, smaller surface — and must ship in lockstep so a new client does not get a neutral storefront with an IKON-branded admin panel.

## 13. Recommended run order (executed by the user, not Lovable)

1. Take ucogold.com offline.
2. Run this storefront scrub prompt in Lovable.
3. Run the parallel CRM scrub prompt.
4. Manually run the `generate_order_number()` migration in Supabase SQL editor.
5. Rotate Dinger keys, take screenshots, commit, `git tag template-v1.0`.
6. Fork to `KenMyanmar/horeca-platform-template`; keep `nikon` as the IKON archive.

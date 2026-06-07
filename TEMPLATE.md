# Myanmar HoReCa B2B Storefront Template

**Version:** 1.0
**Family:** `myanmar-horeca-b2b`
**Intended use:** White-label B2B e-commerce storefront for Myanmar HoReCa (Hotels, Restaurants, Cafes) suppliers. Generic product/brand/category catalog comes pre-loaded; client-specific identity is swapped in via the tokenization layer described below.

---

## Per-Deployment Customization Checklist

All customer-facing brand identity is centralized in **`src/config/brand.ts`**. To deploy for a new client, replace every `{TOKEN}` literal in that file with the client's real values. Nothing else in the codebase should need to change for the basic rebrand.

### Required tokens

| Token | Where it appears | Example value |
|---|---|---|
| `{BRAND_NAME}` | Page titles, headers, footer, auth modal, toasts, About/Contact pages | `"Acme HoReCa"` |
| `{ADDRESS}` | Footer, About, Contact info card | `"No. 12, Pyay Road, Yangon"` |
| `{PHONE}` | Footer, QuoteCTA, Contact card, About | `"09 123 456 789"` |
| `{EMAIL}` | Footer socials, newsletter mailto, Contact card, About | `"hello@acme.com.mm"` |
| `{FACEBOOK_URL}` / `{INSTAGRAM_URL}` / `{MESSENGER_URL}` / `{WHATSAPP_URL}` | Footer social icons | `"https://facebook.com/acme"` |
| `{TRUST_PILLAR_1\|2\|3}` + `_TAGLINE` | Footer pillar strip | `"5-Star Service"` / `"Same-day Yangon delivery"` |
| `{LEGAL_ENTITY}` | Footer copyright line | `"Acme Trading Co., Ltd."` |
| `{PROMISE_1\|2\|3_TITLE}` + `_DESCRIPTION` | About → "Our Promise" section (in `src/pages/About.tsx`) | `"Trusted catalog"` / `"…"` |
| `{ADD_YOUR_STORY_HERE}` | About → "Our Story" paragraph (in `src/pages/About.tsx`) | One paragraph of company history |

### Required asset swaps

| File | Default | Replace with |
|---|---|---|
| `src/assets/brand-logo-placeholder.svg` | Grey "YOUR LOGO" placeholder (200×60) | Client horizontal logo SVG (same aspect) |
| `public/favicon.svg` | Neutral grey rounded square | Client favicon (SVG preferred; 32×32 if PNG) |

### Required meta swaps

`index.html` `<title>`, `og:*`, `twitter:*`, and `<meta name="description">` all contain `{BRAND_NAME}` literals. Search-and-replace once after the brand is finalized.

---

## Where to edit, by section

| Section | File(s) |
|---|---|
| Brand constants (single source of truth) | `src/config/brand.ts` |
| Sitewide head meta | `index.html` |
| Logo (desktop + mobile + auth + reset-password) | `src/assets/brand-logo-placeholder.svg` |
| Favicon | `public/favicon.svg` |
| About page copy (story, promises) | `src/pages/About.tsx` |
| Contact page (form fields, hours, "Why contact us") | `src/pages/Contact.tsx` |
| Footer (columns, pillars, copyright) | `src/components/layout/Footer.tsx` |
| Trust strip on the homepage | `src/components/home/TrustBadgeBar.tsx` |

---

## Out-of-scope items (handled outside this template)

- **Product catalog, brand catalog, category tree, business-type pages** — generic to Myanmar HoReCa, ship as-is. Replace SKUs only if the client carries a different inventory.
- **Long product descriptions** authored in the `products` table may contain residual references from the source dataset (e.g. "contact your account manager"). The new client will overwrite during catalog onboarding.
- **Order-number prefix** (`generate_order_number()` DB trigger) currently mints `IKON-YYYY-NNNNN`. Run the prefix change manually in the Supabase SQL editor per deployment.
- **Tailwind class names with the `ikon-` prefix** (`text-ikon-*`, `bg-ikon-*`, `border-ikon-*`) are legacy internal token names. They are invisible to end users; treat as opaque.
- **Migration history** under `supabase/migrations/` and audit screenshots under `docs/build-screenshots/` — historical record, never edited.
- **CRM (`ikoncrm` repo)** is a separate deployment with its own tokenization. Genericize in lockstep so a new client does not get a neutral storefront with a branded admin panel.

---

## Communication templates

`communication_templates` rows in the database use mustache-style variables (`{{customer_name}}`, `{{order_number}}`, etc.). Brand references in template bodies have been replaced with `{{BRAND_NAME}}`. Substitution happens at send time — wire the `BRAND_NAME` variable into your template renderer (e.g. in `send-order-email`) so order emails ship with the deployed client's name.

---

## Changelog

- **v1.0** — Initial genericization from IKON Mart storefront. All hard-coded brand identity moved to `src/config/brand.ts`. Articles archived, client logos deactivated, banners deactivated. Email templates tokenized to `{{BRAND_NAME}}`.

## Goal
When a visitor lands on `/request-quote?service=<slug>` from a Services card, pre-fill the form context (notes seed + tracking source) and show a friendly banner. Silent fallback if slug doesn't match an active service.

## Changes

### 1. `src/pages/RequestQuotePage.tsx` (modify)

- Read `service` slug from existing `useSearchParams()` (already imported, line 194).
- Add a `useQuery` (`["service-by-slug", slug]`, `enabled: !!slug`, 5-min staleTime) that selects `slug, title` from `services` where `is_active=true`, using `.maybeSingle()`. No error toast on miss — `data` is just `null`.
- Add a `useEffect` keyed on the fetched service that:
  - Seeds the existing `notes` state (the "Additional Notes" textarea — this is the form's message field) with `"I'd like a quote for: {title}"` only if `notes` is currently empty/whitespace. Don't clobber user input.
- Add local state `bannerDismissed` (default `false`).
- On submit (line ~428), replace the hardcoded `source: "e_mall"` with:
  - `source: service ? \`services-page:${service.slug}\` : "e_mall"`
  - Keeps existing default behavior for all non-service entry paths.

### 2. Banner (inline, no new file)

Render at the top of the form body (just above "Contact Information", inside the `space-y-8` container) — only when `service && !bannerDismissed`:

```tsx
<Alert className="relative border-primary/30 bg-primary/5">
  <ClipboardList className="h-4 w-4" />
  <AlertTitle>Pre-filled for "{service.title}"</AlertTitle>
  <AlertDescription>
    Add your details below — we'll respond within 24 hours.
  </AlertDescription>
  <button
    type="button"
    onClick={() => setBannerDismissed(true)}
    aria-label="Dismiss"
    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
  >
    <X className="h-4 w-4" />
  </button>
</Alert>
```

Uses existing shadcn `Alert/AlertTitle/AlertDescription` (`@/components/ui/alert`), plus `ClipboardList` and `X` from `lucide-react` (X already imported).

Spec mentions an optional `src/components/quote/PrefillBanner.tsx`. Since usage is single-site and ~15 lines, keep inline — no new file.

## Acceptance verification

- `/request-quote?service=laundry-design-installation` → banner with title "Laundry Design & Installation"; notes textarea seeded with `"I'd like a quote for: Laundry Design & Installation"`; submit writes `source="services-page:laundry-design-installation"`.
- `/request-quote?service=does-not-exist` → `service` is `null`; no banner, no seed, no error; `source` stays `"e_mall"`.
- `/request-quote` (no param) → unchanged behavior; query disabled; `source="e_mall"`.
- Existing `from=cart` and `product=...` entry paths unaffected (they don't set `service`).

## Out of scope
- No DB changes (`source` column already exists).
- No analytics events.
- No new files / no `PrefillBanner.tsx`.
- No changes to ServicesPage CTA wiring (already emits `?service=<slug>`).
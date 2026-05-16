## Flip the business-landing feature flag ON

### What I'll change

**`.env`** — append one line:

```
VITE_FEATURE_BUSINESS_LANDING=true
```

That's the entire code change. No component edits, no route changes, no DB work.

### Why this works

- `src/App.tsx` already gates the route on `import.meta.env.VITE_FEATURE_BUSINESS_LANDING === "true"`. Setting the var to the string `"true"` registers `/business/:slug` at build time.
- `src/components/home/ShopByBusinessType.tsx` already falls back to `/business/${slugify(biz.label)}` when `link_url` is empty, so the homepage cards will resolve.
- `src/lib/slugify.ts` matches the CRM canonical, so slugs line up with seeded `business_types.label` values (Hotel → `hotel`, etc.).

### After I apply it

1. **Preview** (`id-preview--…lovable.app`) auto-rebuilds in ~10s. Hard-refresh and click a business card — should land on `/business/hotel` etc.
2. **Live site** (`ucogold.com`) will NOT update until you click **Publish → Update** (top-right of the editor on desktop, or the `…` menu → Publish on mobile). Frontend changes require an explicit publish; the flag only goes live after that.
3. If a card 404s, it means CRM seeding for that business type's sub-category mappings isn't done yet — the route renders, but with the friendly empty-state fallback (not a 404) as long as the `business_types` row exists. A true 404 means the slug doesn't match any `business_types.label` after slugification.

### Rollback

Delete the line from `.env` (or set it to `false`) and republish. Instant revert, no data touched.

### Out of scope

- I will NOT run the homepage repoint SQL (that's your CRM step).
- I will NOT seed mappings.
- I will NOT touch `business_types.link_url` rows.
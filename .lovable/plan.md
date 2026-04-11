

# Client Logos: Database + Homepage Carousel

## Summary
Create `client_logos` table and `client-logos` storage bucket with proper RLS. Rewrite the static `ClientLogos` component into a database-driven infinite marquee carousel. Insert it into the homepage between TopBrandsShowcase and NewArrivals.

## Database Migration (single SQL file)

**1. Ensure `update_updated_at_column()` trigger function exists** (not found in existing migrations):
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
```

**2. Create `client_logos` table** with RLS:
- Columns: `id`, `name`, `logo_url`, `website_url`, `sort_order`, `is_active`, `created_at`, `updated_at`
- Public SELECT for active logos; staff ALL via `is_staff()`
- `update_updated_at_column` trigger

**3. Create `client-logos` storage bucket** (public):
- Public SELECT policy
- Staff INSERT/DELETE policies via `is_staff()`

## Frontend Changes

### 1. REWRITE `src/components/home/ClientLogos.tsx`
- Fetch active logos from `client_logos` ordered by `sort_order` (React Query, 5min staleTime)
- Return `null` if no active logos
- CSS `@keyframes` infinite marquee with duplicated children for seamless loop
- Grayscale 70% opacity default → full color + scale(1.05) on hover (CSS transition)
- Pause on hover via `animation-play-state: paused`
- Tooltips via Shadcn Tooltip showing client name
- External link wrapper if `website_url` provided
- `prefers-reduced-motion` → disable auto-scroll
- Responsive: 60px logo height desktop, 50px mobile

### 2. UPDATE `src/pages/Index.tsx`
- Import ClientLogos (already exists as import target)
- Place `<ClientLogos />` between `<TopBrandsShowcase />` and `<NewArrivals />`

### 3. UPDATE `src/integrations/supabase/types.ts`
- Will be auto-regenerated after migration

## Files Summary

| File | Action |
|------|--------|
| New SQL migration | Create table, bucket, RLS, trigger |
| `src/components/home/ClientLogos.tsx` | Full rewrite |
| `src/pages/Index.tsx` | Add ClientLogos between TopBrandsShowcase and NewArrivals |


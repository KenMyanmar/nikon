

# Add HoReCa Resources Section to Homepage

## What
New component `src/components/home/HoReCaResources.tsx` displaying 3 latest published articles in a card grid, placed between `QuotationCTA` and the end of `MainLayout`.

## Changes

### 1. Create `src/components/home/HoReCaResources.tsx`
- Query `articles` table (cast as `any` since not in generated types): status=published, order by is_featured DESC then published_at DESC, limit 3
- Return `null` if no articles
- Header: "HoReCa Resources" centered + subtitle + "View All Articles →" link to `/articles`
- 3-column grid (`grid-cols-1 md:grid-cols-3 gap-6`), each card wrapped in `<Link to={/articles/${slug}}>`:
  - Image with aspect-[16/9], gradient placeholder fallback
  - First tag as pill badge
  - Title (line-clamp-2), excerpt (line-clamp-2)
  - "Read More →" with ArrowRight icon
  - Hover shadow lift
- `staleTime: 5 * 60 * 1000`

### 2. Update `src/pages/Index.tsx`
Add `<HoReCaResources />` after `<QuotationCTA />`:
```
<QuotationCTA />
<HoReCaResources />
```

Two files, no database changes.


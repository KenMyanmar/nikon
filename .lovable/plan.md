

# Articles & Resources Pages — Implementation Plan

## Current State
- `articles` table exists in DB with all columns (id, title, slug, excerpt, body, featured_image_url, tags, status, published_at, author_name, is_featured, sort_order, view_count, meta_title, meta_description, category_id, author_id)
- 6 published articles in DB
- `increment_article_views` RPC exists
- Footer already links to `/articles` and `/articles?tag=*`
- No routes or pages exist yet for articles
- Table is NOT in auto-generated `types.ts` — will use type assertion on Supabase queries

## Files to Create/Modify

### 1. `src/pages/Articles.tsx` — Listing Page

- Header: "Resources & Insights" with subtitle
- Tag filter bar: horizontal pills reading `tag` from URL `searchParams`, updating URL on click
- Featured hero card: first article with `is_featured=true`, shown only when no tag filter active. Horizontal layout (image left 60%, text right 40%), stacks on mobile.
- Article grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`, cards with `max-w-[340px]`
- Each card: featured image (or gradient placeholder), tag badges, title (2-line clamp), excerpt (2-line clamp), date + views, clickable to `/articles/{slug}`
- "Load More" button with offset-based pagination (9 per page)
- Loading skeletons while fetching
- Empty state when no articles found
- Wrapped in `MainLayout`

### 2. `src/pages/ArticleDetail.tsx` — Detail Page

- Breadcrumb using existing `Breadcrumbs` component: Home > Resources > {Tag Display Name}
- Article header: title (text-3xl), author + date + view count, tag badges
- Featured image: full-width, max-h-[400px], object-cover, hidden if no URL
- Body: rendered via `dangerouslySetInnerHTML` with Tailwind `prose` styling
- CTA banner: amber-50 bg with "Get a Quote" and "Browse Products" buttons
- Related articles: 3 cards with overlapping tags, exclude current
- View count increment via `supabase.rpc("increment_article_views")` on mount
- 404/not-found state if slug doesn't match
- Wrapped in `MainLayout`

### 3. `src/App.tsx` — Add 2 Routes

```
<Route path="/articles" element={<Articles />} />
<Route path="/articles/:slug" element={<ArticleDetail />} />
```

## Type Handling

Since `articles` isn't in the generated types, queries will cast the table name:
```typescript
supabase.from("articles" as any).select("...") 
```
And define a local `Article` interface in each page file matching the DB columns.

## No Database Changes Needed

Table, RPC, triggers all exist from Migration 18.


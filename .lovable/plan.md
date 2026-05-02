# Banner Carousel Consumer — Hero

Wire the existing CRM-managed `banners` table (3 active hero rows) into the homepage as an auto-rotating carousel. Preserve the marathon's locked static `Hero` as the fallback for empty/error states.

Storefront-only. No DB changes. No CRM changes. No new dependencies (no Embla).

## Files

### 1. CREATE `src/hooks/useBanners.ts`
React Query hook returning active banners for a position.
- Filter: `is_active = true`, `position = <arg>`, date window via two `.or()` chains (`starts_at` null/≤now, `ends_at` null/≥now)
- Sort: `sort_order` ASC
- `staleTime: 5 * 60 * 1000` (matches Core caching policy)
- Exports `Banner` type with `id`, `title`, `subtitle`, `image_url`, `link_url`, `position`, `sort_order`

### 2. CREATE `src/components/home/HeroBannerCarousel.tsx`
Self-contained carousel, props: `{ banners: Banner[] }`.

**Behavior**
- Active index in `useState`, advances every 7s via `setInterval`
- Pause on `:hover` / `:focus-within` (track via `onMouseEnter/Leave`, `onFocus/Blur` on root)
- `prefers-reduced-motion` via `window.matchMedia` → disables auto-rotate, manual nav still works
- Keyboard: `onKeyDown` ArrowLeft/ArrowRight on root (tabIndex=0)
- Dots: bottom-center, amber for active, neutral white/60 for inactive, click sets index
- Arrows: chevron buttons, `hidden md:flex` group-hover visible, click prev/next with wrap
- ARIA: root `role="region"` `aria-roledescription="carousel"` `aria-label="Promotional banners"`; each slide `aria-roledescription="slide"` `aria-label="Slide N of M"`; inactive slides `aria-hidden`

**Visuals**
- Root: `relative w-full aspect-[16/5] overflow-hidden bg-muted`
- Slides stacked absolutely with opacity transitions (simpler than scroll-snap for 3 slides + reliable index control); `transition-opacity duration-500`
- Image: `object-cover w-full h-full`, `loading="eager"` for first slide only
- Scrim: bottom-left gradient, `bg-gradient-to-tr from-black/55 via-black/30 to-transparent`, ~50% height / 60% width
- Title: `text-[22px] md:text-[36px] font-bold text-white leading-[1.1]`
- Subtitle: `text-sm md:text-lg text-white/85 mt-2 leading-snug` — only rendered when truthy
- Text container: `absolute bottom-0 left-0 max-w-[90%] md:max-w-[60%] p-5 md:p-8`

**Link wrapper (per-slide)** using `parseLink` helper:
- `STOREFRONT_HOSTS = ["ucogold.com", "www.ucogold.com"]`
- `null` / unparseable → render `<div>` (no pointer)
- starts with `/` OR host matches storefront/window → `<Link to={path+search+hash}>` with `cursor-pointer`
- otherwise → `<a href target="_blank" rel="noopener noreferrer">`

### 3. MODIFY `src/pages/Index.tsx`
- Add a local `HeroBannerSection` component in the same file (cleaner than IIFE)
- It calls `useBanners('hero')`:
  - loading → `<Skeleton className="w-full aspect-[16/5]" />` (import from `@/components/ui/skeleton`)
  - error / empty array → `<Hero />` (existing static, untouched)
  - otherwise → `<HeroBannerCarousel banners={data} />`
- Replace `<Hero />` in the JSX with `<HeroBannerSection />`
- Keep `Hero` import — it's used as the fallback. Section order unchanged.

## Edge cases handled
- Internal links stored as `https://ucogold.com/...` are extracted to pathname and routed via `<Link>` — no full page reload (Test 6)
- Slides without `link_url` are non-interactive — no `<Link>`, no `cursor-pointer` (Test 7)
- Empty result set → static Hero fallback (Test 8)
- Single banner → auto-rotate is a no-op (interval still set but `next === current`); arrows/dots hidden when `banners.length <= 1`

## Out of scope
- No DB migration, no CRM changes, no `Hero.tsx` edits, no deletion of static hero
- No Embla / new carousel dependency
- No analytics events on slide click (not requested)

## Verification
Manual against the 10 test items in the prompt. No screenshot commit requested for this prompt — will capture if user asks for the marathon evidence pattern.

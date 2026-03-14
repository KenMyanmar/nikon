

# Customer Reviews Tab — Full Implementation

## Overview
Replace the placeholder reviews tab with a full-featured review system: stats summary, review list, submission form, and header star rating. All data comes from existing `reviews` table and `product_review_stats` view.

## Changes in `src/pages/ProductDetail.tsx`

### 1. Add new queries (near existing product query)

- **reviewStats query**: fetch from `product_review_stats` view filtered by `product.id`
- **reviews query**: fetch approved reviews from `reviews` table, ordered by `created_at` desc, limit 20
- **customer query**: fetch customer record for logged-in user (needed for review submission)

### 2. Add state for review form
- `selectedRating` (number), `commentText` (string), `reviewerName` (string), `isSubmitting` (boolean)
- Pre-fill `reviewerName` from customer name or user email

### 3. Update header star rating (lines 313-321)
Replace the static empty stars with dynamic stars based on `reviewStats`:
- Render filled/empty Star icons based on `avg_rating` (round to nearest half)
- Show `"(N reviews)"` or `"No reviews yet"` as clickable link to scroll to reviews tab

### 4. Replace reviews TabsContent (lines 630-636)
Structure:
```
┌─────────────────────────────────────────┐
│ Review Summary Header                    │
│ ┌──────────┬───────────────────────────┐ │
│ │ 4.2 ★★★★☆│ 5★ ████████████░░ 12     │ │
│ │ 23 reviews│ 4★ ██████░░░░░░░░  6     │ │
│ │          │ 3★ ████░░░░░░░░░░  3     │ │
│ │          │ 2★ ██░░░░░░░░░░░░  1     │ │
│ │          │ 1★ █░░░░░░░░░░░░░  1     │ │
│ └──────────┴───────────────────────────┘ │
├─────────────────────────────────────────┤
│ Individual Review Cards                  │
│ ★★★★★ John D. · Verified · 2 weeks ago │
│ "Great product, exactly what I needed"   │
│   └ IKON Mart replied: "Thank you!"     │
├─────────────────────────────────────────┤
│ Submit Review Form (if logged in)        │
│ ★ ★ ★ ★ ★  click to rate               │
│ [Name field]  [Comment textarea]         │
│ [Submit Review]                          │
│                                          │
│ OR "Sign in to leave a review" if anon   │
└─────────────────────────────────────────┘
```

### 5. Helper: renderStars function
A utility to render N filled + (5-N) outline Star icons for a given rating. Use `text-amber-400` for filled, `text-muted-foreground/30` for empty.

### 6. Helper: relative date
Simple function using `Date.now() - date` to show "X days/weeks/months ago".

### 7. Review submission
- Insert into `reviews` table with `product_id`, `customer_id`, `rating`, `comment`, `reviewer_name`
- On success: toast "Thank you! Your review will appear after approval.", reset form, invalidate queries
- Need to fetch customer_id via `get_customer_id_for_user` or query customers table

### Key details
- Stars color: `text-amber-400` (filled), `text-muted-foreground/30` (empty)
- Progress bars: use `Progress` component or simple div with percentage width, amber color
- Verified badge: small green badge with CheckCircle icon
- Admin response: indented card with "IKON Mart replied:" prefix
- No new files — all changes in ProductDetail.tsx
- Import `Progress` from ui/progress, `useToast` from hooks


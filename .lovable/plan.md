

# Fix Edge Function: RFC 4180 CSV Parser + Deduplication

## Two bugs to fix in `supabase/functions/import-products/index.ts`

### 1. Replace naive line-split with multi-line-aware CSV parser

**Current bug (line 10):** `text.trim().split("\n")` splits on newlines before considering quotes, breaking quoted fields that contain embedded newlines.

**Fix:** Rewrite `parseCSV()` to iterate character-by-character through the entire text, tracking `inQuotes` state. Only split into a new row when hitting a newline while `inQuotes === false`. Remove the separate `parseCSVLine()` function — the new parser handles both line-splitting and field-splitting in one pass.

### 2. Deduplicate each chunk before upserting

**Current bug:** If the same `stock_code` appears twice in a 200-row chunk, Postgres throws "ON CONFLICT DO UPDATE cannot affect a row a second time."

**Fix:** After building the `records` array for each chunk, deduplicate by `stock_code` (keep last occurrence) using a Map before calling `.upsert()`. Apply the same pattern for other tables using their respective conflict keys (`code` for groups, `slug` for categories/brands).

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/import-products/index.ts` | Rewrite `parseCSV`, remove `parseCSVLine`, add `deduplicateBy()` helper, apply dedup before each upsert |

No database or frontend changes needed.


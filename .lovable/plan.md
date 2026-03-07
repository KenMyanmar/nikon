

# Edge Function: import-products + Admin Import Page

## 1. Edge Function (`supabase/functions/import-products/index.ts`)

- **Auth**: Checks `X-Import-Key` header against `IMPORT_SECRET` env var. Returns 401 if mismatch.
- **CORS**: Standard headers + OPTIONS handler.
- **Config**: `verify_jwt = false` in `supabase/config.toml`.
- **CSV Parsing**: Simple line-by-line parser (split by newline, split by comma, handle quoted fields).
- **Routes via `?table=` query param**:
  - `groups`: Upsert into `product_groups` by `code`. Columns: `code`, `name`.
  - `categories`: Lookup `group_id` from `product_groups.code`. Upsert by `slug`. Columns: `name`, `slug`, `group_code`.
  - `brands`: Upsert by `slug`. Columns: `name`, `slug`.
  - `products`: Lookup `category_id` by `categories.name`, `brand_id` by `brands.name`, `group_id` by `product_groups.code`. Auto-generate `slug` from description + stock_code. Force `selling_price = NULL`. Batch upsert by `stock_code` in chunks of 200.
- **Response**: `{ success, table, inserted, updated, errors }`.
- **Secret**: Set `IMPORT_SECRET` = `ikon-import-2026`.

## 2. Admin Import Page (`src/pages/AdminImport.tsx`)

- Route: `/admin/import` added to `App.tsx`.
- Simple functional UI (no main site layout).
- API key input at top (default value from env or manual entry).
- 4 sections: Groups, Categories, Brands, Products — each with file input (.csv), Import button, status display.
- Sends POST to edge function with CSV body as text, `?table=` param, `X-Import-Key` header.
- Displays inserted/updated counts or errors.

## 3. Files to create/modify

| File | Action |
|------|--------|
| `supabase/config.toml` | Add `[functions.import-products]` with `verify_jwt = false` |
| `supabase/functions/import-products/index.ts` | New edge function |
| `src/pages/AdminImport.tsx` | New admin import page |
| `src/App.tsx` | Add `/admin/import` route |

## 4. Secret

Use the secrets tool to set `IMPORT_SECRET` = `ikon-import-2026`.


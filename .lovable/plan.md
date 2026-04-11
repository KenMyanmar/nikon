

# E-Mall Quote System Enhancement

## Summary
Add contact fields, product autocomplete, file attachments, and inline success view to the existing RequestQuotePage. Fix dead links. Add missing DB columns and storage bucket.

## Database Migration

**1. Add missing columns to `quotes`:**
```sql
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'e_mall';
```

**2. Create `quote-attachments` storage bucket:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', true)
ON CONFLICT (id) DO NOTHING;
```
With policies: public SELECT, authenticated INSERT, staff DELETE.

**No changes needed for:**
- `quote_number` generation — trigger `trg_generate_quote_number` already exists
- `attachments` column — already exists as `jsonb DEFAULT '[]'`
- RLS — customers can already create/view/update own quotes

## Frontend Changes

### 1. REWRITE `src/pages/RequestQuotePage.tsx`

**New Section 1 — Contact Information:**
- Company Name (required)
- Contact Person (required, pre-fill from customer `name`)
- Email (required, pre-fill from `user.email`)
- Phone (required, pre-fill from customer `phone`)

**Section 2 — Project Details (keep existing)**

**Section 3 — Products (enhanced):**
- Replace plain text input with `ProductSearchInput` component
- Debounced search (300ms) against `products` via `products_public` view
- Show product name + stock_code in dropdown results
- Keep manual text entry as fallback
- Max 20 rows

**Section 4 — Attachments (new):**
- Upload to `quote-attachments` bucket
- Accept PDF, JPG, PNG, DOCX (max 10MB, max 3 files)
- Store URLs in existing `attachments` JSONB column

**Section 5 — Additional Notes (keep existing)**

**Section 6 — Submit:**
- Add consent checkbox
- On success: show inline success view with quote number, next steps, "Continue Shopping" button (instead of navigating away)

### 2. Fix dead links
- `src/components/layout/Footer.tsx` line 35: `/bulk-orders` → `/request-quote`
- `src/components/home/QuotationCTA.tsx` line 15: `/bulk-orders` → `/request-quote`

## Files Summary

| File | Action |
|------|--------|
| Migration SQL | Add 5 columns, create bucket + policies |
| `src/pages/RequestQuotePage.tsx` | Major rewrite |
| `src/components/layout/Footer.tsx` | Fix dead link |
| `src/components/home/QuotationCTA.tsx` | Fix dead link |


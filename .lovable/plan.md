

# Customer Update Emails — Send Pipeline

## Summary
Wire up actual email delivery for order status change notifications. The DB trigger already creates `customer_communications` records — we need an edge function to send them via Resend, a DB fix to track real delivery status, and a webhook to connect the two.

## Current State
- **DB trigger** `trigger_auto_send_communication()` fires on order status changes, inserts into `customer_communications` with `status='sent'` — but nothing actually sends
- **9 records** already exist with `status='sent'` (dishonest — never delivered)
- **Bug**: trigger inserts `is_auto` column which doesn't exist on `customer_communications` (silent failure via EXCEPTION handler)
- **No Resend connector** linked — no connections in workspace
- **No email domain** configured in Lovable
- **Templates**: 8 auto-send templates with subject/body using `{{order_number}}`, `{{customer_name}}` etc.

## Plan

### Step 1: Connect Resend
Use `standard_connectors--connect` with `resend` connector. This provides `RESEND_API_KEY` and makes it available alongside existing `LOVABLE_API_KEY`.

### Step 2: Database Migration

**Fix the trigger** — change `status` from `'sent'` to `'pending'`, remove `is_auto` column reference:
```sql
-- Fix existing dishonest records
UPDATE customer_communications SET status = 'failed' WHERE status = 'sent';

-- Add is_auto column that trigger expects
ALTER TABLE customer_communications ADD COLUMN IF NOT EXISTS is_auto BOOLEAN DEFAULT false;

-- Recreate trigger function with status='pending' instead of 'sent'
CREATE OR REPLACE FUNCTION trigger_auto_send_communication() ...
  -- Same logic but INSERT with status='pending' instead of 'sent'
```

### Step 3: Create `send-order-email` Edge Function

New file: `supabase/functions/send-order-email/index.ts`

- Accepts POST with `{ communication_id }` (from webhook payload)
- Reads the `customer_communications` record (subject, body, customer email via join)
- Sends via Resend connector gateway (`POST https://connector-gateway.lovable.dev/resend/emails`)
- On success: updates `status` to `'delivered'`
- On failure: updates `status` to `'failed'`
- CORS headers included
- Input validation with the communication_id

### Step 4: Wire Webhook (Manual Step)

The user will need to create a Database Webhook in Supabase Dashboard:
- **Table**: `customer_communications`
- **Event**: INSERT
- **Type**: Supabase Edge Function
- **Function**: `send-order-email`

This can't be done via migration — it's configured in Supabase Dashboard → Database → Webhooks.

## Architecture Flow
```text
Order status change
  → DB trigger inserts customer_communications (status='pending')
    → DB webhook fires on INSERT
      → send-order-email edge function
        → Resend API via connector gateway
          → Updates status to 'delivered' or 'failed'
```

## Files Summary

| File | Action |
|------|--------|
| Resend connector | Connect via standard_connectors |
| SQL migration | Fix trigger (pending not sent), add is_auto column, fix existing records |
| `supabase/functions/send-order-email/index.ts` | Create — reads communication, sends via Resend gateway |

## Notes
- **No frontend changes** — the pipeline is entirely DB + edge function
- **Retry**: For MVP, failed records stay as `'failed'` and can be manually resent from CRM later. A cron-based retry can be added as enhancement.
- **Sender**: Will use `onboarding@resend.dev` for testing. Production requires verifying `ikonmart.com` domain in Resend dashboard.
- **Webhook setup**: Must be done manually in Supabase Dashboard (Database → Webhooks) — not automatable via migration.


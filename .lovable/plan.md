

# Migration 2: Commerce Tables + Auto-Increment Numbers

## What we're building

A single SQL migration creating 9 commerce tables, 2 sequences, 2 functions, and 2 triggers.

## Tables

1. **customers** -- linked to auth.users via user_id (unique), customer_type, credit_limit, payment_terms, is_approved_buyer
2. **customer_addresses** -- multi-address per customer with is_default flag
3. **cart_items** -- customer_id + product_id unique constraint
4. **orders** -- with auto-generated order_number, delivery_address_id FK, payment tracking
5. **order_items** -- line items with denormalized product_name/sku
6. **quotes** -- with auto-generated quote_number, items/response_items JSONB, converted_order_id FK
7. **saved_lists** -- named lists per customer
8. **saved_list_items** -- list_id + product_id unique constraint
9. **banners** -- promotional banners with position, date range, sort_order

## Auto-Increment Logic

- **order_number_seq** + `generate_order_number()` → `IKON-2026-00001`
- **quote_number_seq** + `generate_quote_number()` → `QT-2026-00001`
- BEFORE INSERT triggers on orders/quotes set the number if NULL

## Technical Notes

- No RLS policies yet (Migration 3)
- customers.user_id references auth.users(id) with ON DELETE CASCADE
- All FK references to products, categories use ON DELETE SET NULL or CASCADE as specified
- Single migration file, backend-only, no frontend changes


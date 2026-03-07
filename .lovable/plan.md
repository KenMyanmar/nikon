

# Migration 1: Catalog Tables + Full-Text Search

## What we're building

The first database migration creating all catalog infrastructure: 5 tables, a search trigger, and performance indexes.

## SQL Migration

A single migration that:

1. **Enables `pg_trgm` extension** for fuzzy search
2. **Creates `product_groups`** -- 11 product group codes (e.g., FE, BE, SS)
3. **Creates `categories`** -- 56 normalized categories with slugs, linked to groups
4. **Creates `brands`** -- 150 deduplicated brands with slugs
5. **Creates `products`** -- 4,132 products with all fields including:
   - `unit_cost` (private, numeric(15,2), default 0)
   - `selling_price` (nullable -- NULL means "Request Quote")
   - `search_vector` (tsvector) for full-text search
   - `specifications` JSONB, `images` JSONB
   - All inventory fields (onhand_qty, min_qty, max_qty, etc.)
6. **Creates `pricing_tiers`** -- per-product tiered pricing
7. **Creates trigger function** `update_product_search_vector()` building tsvector from description (A), stock_code (A), other_code (A), short_description (B)
8. **Creates indexes**: GIN on search_vector, trigram GIN on description, B-tree on stock_code, other_code, brand_id, category_id, group_id, selling_price, is_active

## No RLS yet

RLS policies and the `search_products` RPC come in Migration 3. This keeps Migration 1 focused on schema + search infrastructure only.

## No frontend changes

This migration is backend-only. Frontend updates happen after all 3 migrations and the import edge function are complete.


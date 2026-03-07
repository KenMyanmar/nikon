

# Prompt 6A: Seed Featured Data + Update Counts

This is a data-only operation -- no code changes needed. We'll run 5 UPDATE statements using the Supabase insert tool (which handles UPDATE/INSERT data operations).

## Steps

### 1. Mark top 24 in-stock products as featured
```sql
UPDATE products SET is_featured = true
WHERE id IN (
  SELECT id FROM products
  WHERE is_active = true AND stock_status = 'In Stock'
  ORDER BY onhand_qty DESC NULLS LAST
  LIMIT 24
);
```

### 2. Mark 20 key hospitality brands as featured
```sql
UPDATE brands SET is_featured = true
WHERE name IN (
  'ELECTROLUX', 'CAMBRO', 'HOBART', 'SCOTSMAN', 'ARCOS',
  'LACOR', 'HOSHIZAKI', 'ALTO-SHAAM', 'ROBOT COUPE', 'RIEDEL',
  'RATIONAL', 'WINTERHALTER', 'VICTORINOX', 'ZWILLING', 'BRAVILOR',
  'SAMBONET', 'PADERNO', 'DE BUYER', 'MATFER', 'EMILE HENRY'
);
```

### 3. Update product_count on categories
```sql
UPDATE categories c SET product_count = (
  SELECT COUNT(*) FROM products p
  WHERE p.category_id = c.id AND p.is_active = true
);
```

### 4. Update product_count on brands
```sql
UPDATE brands b SET product_count = (
  SELECT COUNT(*) FROM products p
  WHERE p.brand_id = b.id AND p.is_active = true
);
```

### 5. Set sort_order on categories by product count
```sql
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY product_count DESC NULLS LAST) as rn
  FROM categories WHERE is_active = true
)
UPDATE categories c SET sort_order = r.rn
FROM ranked r WHERE c.id = r.id;
```

### 6. Verify with queries
After applying, run verification queries to confirm featured counts and category ordering.

## No code changes required
All frontend components (BestSellers, BrandCarousel, FeaturedCategories) already query `is_featured = true`, `sort_order`, and `product_count`. Once the data is seeded, the homepage will populate automatically.

## After 6A
Once verified, we'll proceed to 6B (Brand Page + Cart + Mega Menu), then 6C (Auth + Account), then 6D (RFQ flow).


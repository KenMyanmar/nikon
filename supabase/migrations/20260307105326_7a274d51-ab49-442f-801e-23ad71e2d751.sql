-- Fix security linter warnings

-- 1. Fix products_public view: use SECURITY INVOKER (default, but explicit)
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = true) AS
SELECT
  p.id, p.stock_code, p.other_code, p.description, p.short_description,
  p.slug, p.selling_price, p.currency, p.unit_of_measure, p.packing,
  p.stock_status, p.thumbnail_url, p.datasheet_url, p.item_type,
  p.main_vendor, p.moq, p.onhand_qty, p.min_qty, p.max_qty, p.reorder_qty,
  p.images, p.specifications, p.is_active, p.is_featured,
  p.brand_id, p.category_id, p.group_id,
  p.search_vector, p.created_at, p.updated_at,
  b.name AS brand_name, b.slug AS brand_slug, b.logo_url AS brand_logo,
  c.name AS category_name, c.slug AS category_slug,
  g.name AS group_name, g.code AS group_code
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_groups g ON p.group_id = g.id
WHERE p.is_active = true;

-- 2. Fix search_products: set search_path
CREATE OR REPLACE FUNCTION public.search_products(search_term TEXT, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID, stock_code TEXT, other_code TEXT, description TEXT, short_description TEXT,
  slug TEXT, selling_price NUMERIC, currency TEXT, stock_status TEXT, thumbnail_url TEXT,
  moq INTEGER, onhand_qty INTEGER, is_featured BOOLEAN,
  brand_name TEXT, brand_slug TEXT, brand_logo TEXT,
  category_name TEXT, category_slug TEXT, group_name TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.stock_code, p.other_code, p.description, p.short_description,
    p.slug, p.selling_price, p.currency, p.stock_status, p.thumbnail_url,
    p.moq, p.onhand_qty, p.is_featured,
    b.name, b.slug, b.logo_url,
    c.name, c.slug, g.name,
    ts_rank(p.search_vector, plainto_tsquery('english', search_term))
  FROM products p
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_groups g ON p.group_id = g.id
  WHERE p.is_active = true
    AND (
      p.search_vector @@ plainto_tsquery('english', search_term)
      OR p.description ILIKE '%' || search_term || '%'
      OR p.stock_code ILIKE '%' || search_term || '%'
      OR p.other_code ILIKE '%' || search_term || '%'
    )
  ORDER BY ts_rank(p.search_vector, plainto_tsquery('english', search_term)) DESC
  LIMIT result_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(TEXT, INTEGER) TO anon, authenticated;

-- 3. Fix other functions missing search_path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'IKON-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := 'QT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.stock_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.other_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B');
  RETURN NEW;
END;
$$;
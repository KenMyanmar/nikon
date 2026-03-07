-- Migration 3: RLS Policies + Search RPC + Public View

-- 1. Helper function to get customer_id for a user (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.get_customer_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.customers WHERE user_id = _user_id LIMIT 1;
$$;

-- 2. products_public view (excludes unit_cost, joins brand/category/group)
CREATE OR REPLACE VIEW public.products_public AS
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

-- 3. Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_list_items ENABLE ROW LEVEL SECURITY;

-- 4. Public SELECT policies
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read brands" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read product_groups" ON public.product_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read pricing_tiers" ON public.pricing_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT TO anon, authenticated USING (is_active = true);

-- 5. Customers - own data
CREATE POLICY "Users manage own customer" ON public.customers FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6. Customer addresses - own data via helper
CREATE POLICY "Users manage own addresses" ON public.customer_addresses FOR ALL TO authenticated
  USING (customer_id = public.get_customer_id_for_user(auth.uid()))
  WITH CHECK (customer_id = public.get_customer_id_for_user(auth.uid()));

-- 7. Cart items - own data via helper
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated
  USING (customer_id = public.get_customer_id_for_user(auth.uid()))
  WITH CHECK (customer_id = public.get_customer_id_for_user(auth.uid()));

-- 8. Orders - read only own
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated
  USING (customer_id = public.get_customer_id_for_user(auth.uid()));

-- 9. Order items - read only via orders
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT TO authenticated
  USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id_for_user(auth.uid())
  ));

-- 10. Quotes - own data via helper
CREATE POLICY "Users manage own quotes" ON public.quotes FOR ALL TO authenticated
  USING (customer_id = public.get_customer_id_for_user(auth.uid()))
  WITH CHECK (customer_id = public.get_customer_id_for_user(auth.uid()));

-- 11. Saved lists - own data via helper
CREATE POLICY "Users manage own saved lists" ON public.saved_lists FOR ALL TO authenticated
  USING (customer_id = public.get_customer_id_for_user(auth.uid()))
  WITH CHECK (customer_id = public.get_customer_id_for_user(auth.uid()));

-- 12. Saved list items - own data via saved_lists
CREATE POLICY "Users manage own list items" ON public.saved_list_items FOR ALL TO authenticated
  USING (list_id IN (
    SELECT id FROM public.saved_lists WHERE customer_id = public.get_customer_id_for_user(auth.uid())
  ))
  WITH CHECK (list_id IN (
    SELECT id FROM public.saved_lists WHERE customer_id = public.get_customer_id_for_user(auth.uid())
  ));

-- 13. search_products RPC
CREATE OR REPLACE FUNCTION public.search_products(search_term TEXT, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID, stock_code TEXT, other_code TEXT, description TEXT, short_description TEXT,
  slug TEXT, selling_price NUMERIC, currency TEXT, stock_status TEXT, thumbnail_url TEXT,
  moq INTEGER, onhand_qty INTEGER, is_featured BOOLEAN,
  brand_name TEXT, brand_slug TEXT, brand_logo TEXT,
  category_name TEXT, category_slug TEXT, group_name TEXT,
  rank REAL
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to both roles
GRANT EXECUTE ON FUNCTION public.search_products(TEXT, INTEGER) TO anon, authenticated;
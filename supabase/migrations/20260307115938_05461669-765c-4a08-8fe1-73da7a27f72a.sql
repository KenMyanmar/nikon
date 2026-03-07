
UPDATE products SET is_featured = true
WHERE id IN (
  SELECT id FROM products
  WHERE is_active = true AND stock_status = 'in_stock'
  ORDER BY onhand_qty DESC NULLS LAST
  LIMIT 24
);

INSERT INTO public.flash_deals (
  id, product_id, title, original_price, flash_price,
  stock_limit, sold_count, start_time, end_time, is_active, badge_text, sort_order
) VALUES (
  '00000000-0000-0000-0000-00000000beef'::uuid,
  '13d0f744-e764-413a-a6a0-98c5e5763d62'::uuid,
  'Gate Evidence — TEMP',
  50840, 35588, 100, 35,
  now() - interval '5 minutes', now() + interval '24 hours',
  true, 'Flash Deal', 0
);
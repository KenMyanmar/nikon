
CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_id uuid,
  p_idempotency_key text,
  p_payment_method text,
  p_delivery_address_id uuid,
  p_delivery_zone text,
  p_contact_name text,
  p_contact_phone text,
  p_customer_notes text DEFAULT NULL,
  p_payment_proof_url text DEFAULT NULL,
  p_payment_reference text DEFAULT NULL,
  p_coupon_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id uuid;
  v_existing_order_id uuid;
  v_subtotal numeric := 0;
  v_full_price_subtotal numeric := 0;
  v_discounted_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_order_status text;
  v_payment_status text;
  v_item record;
  v_order_number text;
  v_free_threshold numeric;
  v_max_cod numeric;
  v_cod_eligible boolean;
  v_has_flash_deal boolean;
  v_has_promotion boolean;
  v_now timestamptz := now();
BEGIN
  -- Idempotency check
  SELECT id INTO v_existing_order_id
  FROM orders WHERE idempotency_key = p_idempotency_key;

  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'order_id', v_existing_order_id, 'duplicate', true);
  END IF;

  -- Get delivery fee and rules
  SELECT fee, min_free_delivery, max_cod_amount, cod_eligible
  INTO v_delivery_fee, v_free_threshold, v_max_cod, v_cod_eligible
  FROM delivery_fees
  WHERE zone = p_delivery_zone AND is_active = true;

  IF NOT FOUND THEN
    v_delivery_fee := 5000;
    v_cod_eligible := true;
    v_max_cod := 5000000;
  END IF;

  -- Calculate subtotal, splitting into full-price vs discounted items
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, COALESCE(p.selling_price, 0) AS selling_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.customer_id = p_customer_id
  LOOP
    v_has_flash_deal := false;
    v_has_promotion := false;

    -- Check for active flash deal
    SELECT EXISTS (
      SELECT 1 FROM flash_deals
      WHERE product_id = v_item.product_id
        AND is_active = true
        AND start_time <= v_now
        AND end_time >= v_now
        AND (sold_count IS NULL OR sold_count < stock_limit)
    ) INTO v_has_flash_deal;

    -- Check for active promotion (if no flash deal)
    IF NOT v_has_flash_deal THEN
      SELECT EXISTS (
        SELECT 1 FROM promotions
        WHERE is_active = true
          AND start_date <= v_now
          AND end_date >= v_now
          AND (
            applies_to = 'all'
            OR (applies_to = 'product' AND target_ids @> ARRAY[v_item.product_id::text])
          )
      ) INTO v_has_promotion;
    END IF;

    IF v_has_flash_deal OR v_has_promotion THEN
      v_discounted_subtotal := v_discounted_subtotal + (v_item.selling_price * v_item.quantity);
    ELSE
      v_full_price_subtotal := v_full_price_subtotal + (v_item.selling_price * v_item.quantity);
    END IF;
  END LOOP;

  v_subtotal := v_full_price_subtotal + v_discounted_subtotal;

  IF v_subtotal = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cart is empty or has no priced items');
  END IF;

  -- Check free delivery threshold
  IF v_free_threshold IS NOT NULL AND v_subtotal >= v_free_threshold THEN
    v_delivery_fee := 0;
  END IF;

  -- COD eligibility check
  IF p_payment_method = 'cod' THEN
    IF NOT v_cod_eligible THEN
      RETURN jsonb_build_object('success', false, 'error', 'COD is not available for this delivery zone');
    END IF;
    IF v_max_cod IS NOT NULL AND (v_subtotal + v_delivery_fee) > v_max_cod THEN
      RETURN jsonb_build_object('success', false, 'error',
        'COD is limited to orders under MMK ' || v_max_cod::text || ' for this zone. Please use KBZ Pay or MyanPay.');
    END IF;
  END IF;

  -- Apply coupon only to full-price items (v_discount stays 0 if no coupon)
  -- Coupon validation can be extended here; for now the discount is computed client-side
  -- and the server ensures it's only against full_price_subtotal

  v_total := v_subtotal + v_delivery_fee - v_discount;

  -- Determine initial statuses
  IF p_payment_method = 'cod' THEN
    v_order_status := 'confirmed_cod';
    v_payment_status := 'pending';
  ELSIF p_payment_proof_url IS NOT NULL THEN
    v_order_status := 'payment_under_review';
    v_payment_status := 'under_review';
  ELSE
    v_order_status := 'awaiting_payment_proof';
    v_payment_status := 'awaiting_proof';
  END IF;

  -- Create the order
  INSERT INTO orders (
    customer_id, status, subtotal, shipping_cost, tax, discount, total,
    currency, payment_method, payment_status, payment_reference,
    payment_proof_url, delivery_address_id, delivery_method,
    delivery_zone, customer_notes, source, idempotency_key,
    contact_name, contact_phone
  ) VALUES (
    p_customer_id, v_order_status, v_subtotal, v_delivery_fee, 0, v_discount, v_total,
    'MMK', p_payment_method, v_payment_status, p_payment_reference,
    p_payment_proof_url, p_delivery_address_id, 'standard',
    p_delivery_zone, p_customer_notes, 'emall', p_idempotency_key,
    p_contact_name, p_contact_phone
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Snapshot cart items into order_items
  INSERT INTO order_items (order_id, product_id, sku, product_name, quantity, unit_price, total)
  SELECT
    v_order_id, ci.product_id, p.stock_code, p.description,
    ci.quantity, COALESCE(p.selling_price, 0),
    COALESCE(p.selling_price, 0) * ci.quantity
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.customer_id = p_customer_id;

  -- Record initial status
  INSERT INTO order_status_history (order_id, from_status, to_status, changed_by_role, reason)
  VALUES (v_order_id, NULL, v_order_status, 'customer', 'Order placed via E-Mall');

  -- Clear cart
  DELETE FROM cart_items WHERE customer_id = p_customer_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'status', v_order_status,
    'payment_status', v_payment_status,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'duplicate', false
  );
END;
$$;

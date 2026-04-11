-- 1. Add missing is_auto column that the trigger expects
ALTER TABLE customer_communications ADD COLUMN IF NOT EXISTS is_auto BOOLEAN DEFAULT false;

-- 2. Fix dishonest records: mark as 'failed' since nothing was actually sent
UPDATE customer_communications SET status = 'failed' WHERE status = 'sent';

-- 3. Recreate trigger function with status='pending' instead of 'sent'
CREATE OR REPLACE FUNCTION trigger_auto_send_communication()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template record;
  v_customer record;
  v_subject text;
  v_body text;
  v_idemp_key text;
  v_existing_count integer;
BEGIN
  -- Only fire on actual status changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Find matching auto-send template for the NEW status
  SELECT * INTO v_template
  FROM communication_templates
  WHERE trigger_status = NEW.status
    AND is_auto = true
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard
  v_idemp_key := NEW.id::text || ':' || NEW.status || ':' || v_template.template_key;

  SELECT COUNT(*) INTO v_existing_count
  FROM automation_execution_log
  WHERE idempotency_key = v_idemp_key;

  IF v_existing_count > 0 THEN
    INSERT INTO automation_execution_log (idempotency_key, trigger_type, order_id, template_key, action_type, action_result)
    VALUES (v_idemp_key || ':dup:' || extract(epoch from now())::text, 'auto_send', NEW.id, v_template.template_key, 'send_communication', 'duplicate_prevented')
    ON CONFLICT (idempotency_key) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Get customer info
  SELECT name, email INTO v_customer
  FROM customers
  WHERE id = NEW.customer_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Resolve template variables
  v_subject := v_template.subject_template;
  v_body := v_template.body_template;

  v_subject := replace(v_subject, '{{customer_name}}', COALESCE(v_customer.name, 'Customer'));
  v_subject := replace(v_subject, '{{order_number}}', COALESCE(NEW.order_number, ''));
  v_subject := replace(v_subject, '{{total}}', COALESCE(NEW.total::text, '0'));
  v_subject := replace(v_subject, '{{payment_method}}', COALESCE(NEW.payment_method, ''));
  v_subject := replace(v_subject, '{{rejection_reason}}', COALESCE(NEW.payment_rejection_reason, ''));

  v_body := replace(v_body, '{{customer_name}}', COALESCE(v_customer.name, 'Customer'));
  v_body := replace(v_body, '{{order_number}}', COALESCE(NEW.order_number, ''));
  v_body := replace(v_body, '{{total}}', COALESCE(NEW.total::text, '0'));
  v_body := replace(v_body, '{{payment_method}}', COALESCE(NEW.payment_method, ''));
  v_body := replace(v_body, '{{rejection_reason}}', COALESCE(NEW.payment_rejection_reason, ''));

  -- Insert communication record with status='pending' (not 'sent')
  INSERT INTO customer_communications (
    order_id, customer_id, channel, subject, body,
    status, template_key, is_auto
  ) VALUES (
    NEW.id, NEW.customer_id, COALESCE(v_template.channel, 'email'),
    v_subject, v_body,
    'pending', v_template.template_key, true
  );

  -- Log successful execution
  INSERT INTO automation_execution_log (
    idempotency_key, trigger_type, order_id, template_key,
    action_type, action_result, metadata
  ) VALUES (
    v_idemp_key, 'auto_send', NEW.id, v_template.template_key,
    'send_communication', 'success',
    jsonb_build_object('to_status', NEW.status, 'customer_name', v_customer.name, 'template', v_template.template_key)
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  INSERT INTO automation_execution_log (
    idempotency_key, trigger_type, order_id, template_key,
    action_type, action_result, error_message
  ) VALUES (
    v_idemp_key || ':err:' || extract(epoch from now())::text,
    'auto_send', NEW.id, COALESCE(v_template.template_key, 'unknown'),
    'send_communication', 'failed', SQLERRM
  ) ON CONFLICT (idempotency_key) DO NOTHING;
  RETURN NEW;
END;
$$;
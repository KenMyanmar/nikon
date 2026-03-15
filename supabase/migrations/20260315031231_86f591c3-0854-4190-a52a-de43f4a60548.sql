
-- RLS policies for payment-proofs bucket (bucket already exists)

-- Customers can upload their own payment proofs
CREATE POLICY "Customers upload payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = (SELECT id::text FROM public.customers WHERE user_id = auth.uid() LIMIT 1));

-- Customers can read their own proofs
CREATE POLICY "Customers read own proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = (SELECT id::text FROM public.customers WHERE user_id = auth.uid() LIMIT 1));

-- Staff can read all proofs
CREATE POLICY "Staff read all proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid() AND is_active = true));

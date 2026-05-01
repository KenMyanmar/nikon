-- Parallel storage path for normalized product images (Prompt 5)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images-normalized', 'product-images-normalized', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read normalized product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images-normalized');

-- Writes are service-role only (no policy for anon/authenticated INSERT/UPDATE/DELETE).
-- The normalization edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
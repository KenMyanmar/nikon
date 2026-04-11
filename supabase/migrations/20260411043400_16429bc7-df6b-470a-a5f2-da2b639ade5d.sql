
-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create client_logos table
CREATE TABLE public.client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_client_logos_updated_at
  BEFORE UPDATE ON public.client_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- Public can read active logos
CREATE POLICY "Anyone can view active client logos"
  ON public.client_logos FOR SELECT
  USING (is_active = true);

-- Staff can manage all logos
CREATE POLICY "Staff can manage client logos"
  ON public.client_logos FOR ALL
  USING (public.is_staff());

-- Create public storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: public read
CREATE POLICY "Public read client logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');

-- Storage: staff upload
CREATE POLICY "Staff upload client logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-logos' AND public.is_staff());

-- Storage: staff delete
CREATE POLICY "Staff delete client logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'client-logos' AND public.is_staff());

-- Add missing contact/source columns to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'e_mall';

-- Create quote-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for quote attachments
CREATE POLICY "Public read quote attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quote-attachments');

-- Authenticated users can upload quote attachments
CREATE POLICY "Authenticated upload quote attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quote-attachments' AND auth.role() = 'authenticated');

-- Staff can delete quote attachments
CREATE POLICY "Staff delete quote attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'quote-attachments' AND public.is_staff());
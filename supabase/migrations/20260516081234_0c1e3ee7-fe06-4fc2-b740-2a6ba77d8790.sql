-- Create public bucket for admin media
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-media', 'admin-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read
CREATE POLICY "Public can view admin-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-media');

-- Admins can upload
CREATE POLICY "Admins can upload admin-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update admin-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete admin-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-media' AND has_role(auth.uid(), 'admin'::app_role));
-- Drop the public insert policy that references nik
DROP POLICY IF EXISTS "public can submit registration" ON public.registrations;

-- Drop the nik column
ALTER TABLE public.registrations DROP COLUMN IF EXISTS nik;

-- Recreate the public insert policy without nik checks
CREATE POLICY "public can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) >= 2 AND length(full_name) <= 200
  AND length(email) >= 5 AND length(email) <= 200
  AND email LIKE '%_@_%._%'
  AND length(whatsapp) >= 6 AND length(whatsapp) <= 25
  AND length(address) >= 5 AND length(address) <= 500
  AND status = 'approved'::registration_status
);
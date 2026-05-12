DROP POLICY IF EXISTS "public can submit document" ON public.documents;

CREATE POLICY "public can submit document"
ON public.documents
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) >= 5 AND length(email) <= 200
  AND email LIKE '%_@_%._%'
  AND length(doc_type) >= 1 AND length(doc_type) <= 500
  AND length(file_url) >= 5 AND length(file_url) <= 2000
);
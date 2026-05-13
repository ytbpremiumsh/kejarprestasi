ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS email_key text GENERATED ALWAYS AS (lower(btrim(email))) STORED,
  ADD COLUMN IF NOT EXISTS doc_key text GENERATED ALWAYS AS (lower(btrim(doc_type))) STORED;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY lower(btrim(email)), kind, lower(btrim(doc_type))
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.documents
)
DELETE FROM public.documents d
USING ranked r
WHERE d.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS documents_unique_sender_kind_doc
  ON public.documents (email_key, kind, doc_key);

CREATE INDEX IF NOT EXISTS idx_documents_email_key_kind
  ON public.documents (email_key, kind);
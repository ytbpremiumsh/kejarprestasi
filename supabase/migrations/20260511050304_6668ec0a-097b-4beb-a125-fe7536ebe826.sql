REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

DROP POLICY IF EXISTS "admins view registrations" ON public.registrations;
DROP POLICY IF EXISTS "admins update registrations" ON public.registrations;
DROP POLICY IF EXISTS "admins delete registrations" ON public.registrations;

CREATE POLICY "admins view registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

CREATE POLICY "admins update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

CREATE POLICY "admins delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "admins view documents" ON public.documents;
DROP POLICY IF EXISTS "admins delete documents" ON public.documents;

CREATE POLICY "admins view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

CREATE POLICY "admins delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins can view all roles" ON public.user_roles;
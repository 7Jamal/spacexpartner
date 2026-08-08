-- Employees: no delete on document records
DROP POLICY IF EXISTS "manage own documents" ON public.employee_documents;

CREATE POLICY "read own documents" ON public.employee_documents
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "insert own documents" ON public.employee_documents
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Employees: no delete/update on stored files
DROP POLICY IF EXISTS "own docs delete" ON storage.objects;
DROP POLICY IF EXISTS "own docs update" ON storage.objects;
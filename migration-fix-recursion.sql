-- ============================================================
-- FIX: Recursão infinita nas políticas de profiles
-- Execute TUDO de uma vez no SQL Editor
-- ============================================================

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'appointments', 'documents')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3. Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 4. PROFILES — políticas sem subquery (sem recursão)
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- 5. APPOINTMENTS
CREATE POLICY "appointments_select"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_insert"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_update"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_delete"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- 6. DOCUMENTS
CREATE POLICY "documents_select"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents_insert"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_delete"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Confirmar políticas ativas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'appointments', 'documents')
ORDER BY tablename, cmd;

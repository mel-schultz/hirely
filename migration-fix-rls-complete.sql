-- ============================================================
-- CORREÇÃO COMPLETA DE RLS — Execute tudo de uma vez
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "self_select"              ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all"         ON public.profiles;
DROP POLICY IF EXISTS "self_update"              ON public.profiles;
DROP POLICY IF EXISTS "superadmin_update_all"    ON public.profiles;
DROP POLICY IF EXISTS "insert_own"               ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy"   ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"          ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"        ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Recriar simples e corretas
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (true); -- todos autenticados podem ler (RLS já filtra por auth.uid)

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

-- ── APPOINTMENTS ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own appointments"  ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments"   ON public.appointments;

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

-- ── DOCUMENTS ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents"  ON public.documents;

CREATE POLICY "documents_select"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents_insert"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_delete"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- ── VERIFICAR ────────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'appointments', 'documents')
ORDER BY tablename, cmd;

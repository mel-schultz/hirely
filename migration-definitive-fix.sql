-- ============================================================
-- PASSO 1: Ver o estado atual
-- ============================================================
SELECT id, user_id, email, role, updated_at
FROM public.profiles
WHERE email = 'mel.schultz@yahoo.com';

-- ============================================================
-- PASSO 2: Remover TODAS as políticas da tabela profiles
-- ============================================================
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- PASSO 3: Desabilitar RLS temporariamente para forçar o UPDATE
-- ============================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASSO 4: Corrigir o constraint e promover super_admin
-- ============================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('candidate', 'admin', 'super_admin'));

UPDATE public.profiles
  SET role = 'super_admin', updated_at = now()
  WHERE email = 'mel.schultz@yahoo.com';

-- ============================================================
-- PASSO 5: Reativar RLS com políticas corretas e simples
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política única: cada um vê o próprio perfil
CREATE POLICY "self_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Super admin e admin veem todos
CREATE POLICY "admin_select_all"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
    IN ('admin', 'super_admin')
  );

-- Cada um atualiza o próprio perfil
CREATE POLICY "self_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Super admin atualiza qualquer perfil
CREATE POLICY "superadmin_update_all"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
    = 'super_admin'
  );

-- Insert somente pelo trigger
CREATE POLICY "insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PASSO 6: Confirmar resultado final
-- ============================================================
SELECT email, role, updated_at FROM public.profiles
WHERE email = 'mel.schultz@yahoo.com';

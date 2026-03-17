-- ============================================================
-- MIGRATION: Adicionar super_admin ao sistema Hirely
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Atualizar o CHECK constraint para aceitar super_admin
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('candidate', 'admin', 'super_admin'));

-- 2. Promover mel.schultz@yahoo.com para super_admin
UPDATE public.profiles
  SET role = 'super_admin'
  WHERE email = 'mel.schultz@yahoo.com';

-- 3. Adicionar política para super_admin atualizar perfis
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- 4. Corrigir política de visualização para incluir super_admin
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- 5. Atualizar trigger para auto-promover super_admin no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    CASE
      WHEN NEW.email = 'mel.schultz@yahoo.com' THEN 'super_admin'
      ELSE 'candidate'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar resultado
SELECT email, role FROM public.profiles ORDER BY role, created_at;

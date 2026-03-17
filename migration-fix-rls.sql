-- ============================================================
-- MIGRATION v2: Corrigir RLS para leitura do próprio perfil
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Remover todas as políticas de SELECT existentes na tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar UMA política unificada de SELECT que cobre todos os casos
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (
    -- Usuário sempre pode ver o próprio perfil
    auth.uid() = user_id
    OR
    -- Admins e super_admins podem ver todos
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- Garantir que usuário pode atualizar o próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Super admin pode atualizar qualquer perfil
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

-- Confirmar o role atual do super admin
SELECT id, email, role, updated_at
FROM public.profiles
WHERE email = 'mel.schultz@yahoo.com';

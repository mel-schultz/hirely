-- ============================================================
-- MIGRATION DEFINITIVA — Execute linha por linha se necessário
-- ============================================================

-- 1. Ver o estado atual (execute isso primeiro)
SELECT id, email, role FROM public.profiles 
WHERE email = 'mel.schultz@yahoo.com';

-- ============================================================
-- Se a query acima retornou role != 'super_admin', continue:
-- ============================================================

-- 2. Remover o constraint antigo que só aceita 'candidate' e 'admin'
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Recriar o constraint aceitando super_admin
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('candidate', 'admin', 'super_admin'));

-- 4. Desabilitar RLS para forçar o update sem bloqueio
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Fazer o update
UPDATE public.profiles 
  SET role = 'super_admin', 
      updated_at = NOW() 
WHERE email = 'mel.schultz@yahoo.com';

-- 6. Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Confirmar resultado
SELECT id, email, role, updated_at FROM public.profiles 
WHERE email = 'mel.schultz@yahoo.com';

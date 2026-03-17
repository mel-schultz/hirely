# 🟢 Hirely — Plataforma de Admissão Digital

Aplicação web responsiva para gerenciar o processo de admissão de novos colaboradores, incluindo cadastro, agendamento de exame médico e envio de documentos.

---

## 🚀 Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Estilo**: Tailwind CSS (tema escuro customizado)
- **Backend/DB**: Supabase (Auth + PostgreSQL + Storage)
- **Deploy**: Vercel

---

## 📋 Funcionalidades

### Candidato
- ✅ Cadastro com nome, e-mail, senha, CPF e telefone
- ✅ Login/logout com sessão persistente
- ✅ Dashboard com timeline visual do processo
- ✅ Agendamento da consulta na clínica (com auto-preenchimento dos dados da Guia)
- ✅ Upload de documentos (Prontuário, Guia, ASO, Outros)
- ✅ Download e visualização de documentos enviados
- ✅ Perfil editável

### Admin
- ✅ Painel com todos os candidatos
- ✅ Status de cada etapa por candidato
- ✅ Visualização e download dos documentos enviados

---

## ⚙️ Como configurar

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute o conteúdo do arquivo `supabase-schema.sql`
3. Anote as chaves do projeto em **Settings → API**

### 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy na Vercel

### Opção A — Via GitHub (recomendado)

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → URL da Vercel (ex: `https://hirely.vercel.app`)
5. Clique em **Deploy**

### Opção B — Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🗄️ Estrutura do projeto

```
hirely/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Estilos globais
│   ├── auth/
│   │   ├── login/page.tsx        # Login
│   │   ├── register/page.tsx     # Cadastro
│   │   └── callback/route.ts     # OAuth callback
│   └── dashboard/
│       ├── layout.tsx            # Layout com sidebar
│       ├── page.tsx              # Dashboard principal
│       ├── schedule/page.tsx     # Agendamento
│       ├── documents/page.tsx    # Documentos
│       ├── profile/page.tsx      # Perfil
│       └── admin/page.tsx        # Painel admin
├── components/
│   ├── layout/
│   │   └── DashboardShell.tsx    # Sidebar + topbar
│   ├── forms/
│   │   ├── ScheduleForm.tsx      # Form de agendamento
│   │   └── ProfileForm.tsx       # Form de perfil
│   ├── admin/
│   │   └── AdminCandidates.tsx   # Lista admin
│   ├── OnboardingTimeline.tsx    # Timeline visual
│   ├── StatsRow.tsx              # Cards de status
│   └── DocumentsSection.tsx     # Upload/listagem docs
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase
│   │   ├── server.ts             # Server-side Supabase
│   │   └── middleware.ts         # Auth middleware
│   └── utils.ts                  # Helpers
├── types/index.ts                # TypeScript types
├── middleware.ts                 # Next.js middleware
├── supabase-schema.sql           # Schema do banco
└── vercel.json                   # Config Vercel
```

---

## 👤 Criar conta Admin

Após criar uma conta normal, execute no **SQL Editor** do Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

---

## 📄 Documentos suportados

| Tipo | Descrição |
|------|-----------|
| `prontuario` | Prontuário Clínico (anamnese) |
| `guia_encaminhamento` | Guia de Encaminhamento da clínica |
| `aso` | Atestado de Saúde Ocupacional |
| `outros` | Outros documentos complementares |

Formatos aceitos: **PDF, JPG, PNG** (máx. 10MB por arquivo)

---

## 🔐 Segurança

- Row Level Security (RLS) ativo em todas as tabelas
- Cada usuário acessa apenas seus próprios dados
- Admins têm acesso read-only a todos os registros
- Storage com políticas por pasta de usuário

---

## 📞 Suporte

Para dúvidas sobre a integração com Supabase ou deploy na Vercel, consulte:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

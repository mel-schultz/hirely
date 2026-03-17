export const SUPER_ADMIN_EMAIL = 'mel.schultz@yahoo.com'

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  candidate: 'Candidato',
}

export const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  admin:       'text-brand-400 bg-brand-500/10 border-brand-500/20',
  candidate:   'text-slate-400 bg-slate-700/50 border-slate-600/50',
}

export const ONBOARDING_STEP_LABELS: Record<string, string> = {
  schedule:  'Ag. pendente',
  documents: 'Ag. documentos',
  complete:  'Concluído',
}

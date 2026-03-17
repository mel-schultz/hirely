export type OnboardingStep =
  | 'register'
  | 'schedule'
  | 'documents'
  | 'complete'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type DocumentType =
  | 'prontuario'
  | 'guia_encaminhamento'
  | 'aso'
  | 'outros'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  cpf?: string
  rg?: string
  birth_date?: string
  phone?: string
  role: 'candidate' | 'admin'
  onboarding_step: OnboardingStep
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  cnpj: string
  created_at: string
}

export interface JobPosition {
  id: string
  company_id: string
  title: string
  department: string
  location: string
  company?: Company
}

export interface Appointment {
  id: string
  user_id: string
  clinic_name: string
  clinic_address: string
  clinic_phone?: string
  clinic_email?: string
  scheduled_date: string
  scheduled_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  type: DocumentType
  file_name: string
  file_url: string
  file_size: number
  uploaded_at: string
  notes?: string
}

export interface OnboardingData {
  profile: Profile | null
  appointment: Appointment | null
  documents: Document[]
  currentStep: number
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStepNumber(step: string): number {
  const steps = ['register', 'schedule', 'documents', 'complete']
  return steps.indexOf(step) + 1
}

export function getDocumentLabel(type: string): string {
  const labels: Record<string, string> = {
    prontuario: 'Prontuário Clínico',
    guia_encaminhamento: 'Guia de Encaminhamento',
    aso: 'ASO - Atestado de Saúde Ocupacional',
    outros: 'Outros Documentos',
  }
  return labels[type] || type
}

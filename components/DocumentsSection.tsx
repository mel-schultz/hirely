'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, Trash2, Download, Loader2,
  FilePlus, CheckCircle2, AlertCircle, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn, formatFileSize, getDocumentLabel, formatDateShort } from '@/lib/utils'

interface Props {
  documents: any[]
  userId: string
}

const DOCUMENT_TYPES = [
  { value: 'prontuario', label: 'Prontuário Clínico', desc: 'Formulário de anamnese e histórico médico' },
  { value: 'guia_encaminhamento', label: 'Guia de Encaminhamento', desc: 'Guia com dados do exame e clínica' },
  { value: 'aso', label: 'ASO - Atestado de Saúde Ocupacional', desc: 'Resultado final do exame admissional' },
  { value: 'outros', label: 'Outros Documentos', desc: 'Documentos complementares' },
]

export default function DocumentsSection({ documents, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [selectedType, setSelectedType] = useState('prontuario')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]

    // Validate
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 10MB')
      return
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(file.type)) {
      toast.error('Formato não suportado. Use PDF, JPG ou PNG')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}_${selectedType}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        type: selectedType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
      })
      if (dbError) throw dbError

      // Update onboarding if first document
      if (documents.length === 0) {
        await supabase.from('profiles').update({ onboarding_step: 'complete' }).eq('user_id', userId)
      }

      toast.success('Documento enviado com sucesso!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar documento')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(doc: any) {
    setDeletingId(doc.id)
    try {
      // Extract storage path from URL
      const url = new URL(doc.file_url)
      const pathParts = url.pathname.split('/documents/')
      if (pathParts[1]) {
        await supabase.storage.from('documents').remove([pathParts[1]])
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id)
      if (error) throw error
      toast.success('Documento removido')
      router.refresh()
    } catch (err: any) {
      toast.error('Erro ao remover documento')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FilePlus size={18} className="text-brand-400" />
          Enviar novo documento
        </h3>

        {/* Type selector */}
        <div>
          <label className="label-text">Tipo do documento</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {DOCUMENT_TYPES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedType(value)}
                className={cn(
                  'text-left p-3 rounded-xl border transition-all duration-200',
                  selectedType === value
                    ? 'border-brand-500/50 bg-brand-500/10 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                )}
              >
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
            dragging ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40'
          )}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files) }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => handleUpload(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-brand-400 animate-spin" />
              <p className="text-slate-400 text-sm">Enviando documento...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className={cn(dragging ? 'text-brand-400' : 'text-slate-500')} />
              <p className="text-white text-sm font-medium">
                {dragging ? 'Solte o arquivo aqui' : 'Clique ou arraste o arquivo'}
              </p>
              <p className="text-slate-500 text-xs">PDF, JPG ou PNG • Máximo 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents list */}
      <div>
        <h3 className="font-semibold text-white mb-3">
          Documentos enviados
          {documents.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-500">{documents.length} arquivo{documents.length !== 1 ? 's' : ''}</span>
          )}
        </h3>

        {documents.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FileText size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum documento enviado ainda</p>
            <p className="text-slate-600 text-xs mt-1">Envie seus documentos após realizar o exame admissional</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => (
              <div key={doc.id} className="glass-card-hover p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{doc.file_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2 py-0.5">
                      {getDocumentLabel(doc.type)}
                    </span>
                    <span className="text-xs text-slate-600">{formatFileSize(doc.file_size)}</span>
                    <span className="text-xs text-slate-600">
                      {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                    title="Visualizar"
                  >
                    <Eye size={15} />
                  </a>
                  <a
                    href={doc.file_url}
                    download={doc.file_name}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Baixar"
                  >
                    <Download size={15} />
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    title="Remover"
                  >
                    {deletingId === doc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents guide */}
      <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-300 text-sm font-medium mb-1">Documentos necessários</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• <strong className="text-slate-300">Prontuário Clínico</strong> — preenchido pelo médico durante o exame</li>
              <li>• <strong className="text-slate-300">Guia de Encaminhamento</strong> — emitida pela clínica agendada</li>
              <li>• <strong className="text-slate-300">ASO</strong> — Atestado de Saúde Ocupacional com resultado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

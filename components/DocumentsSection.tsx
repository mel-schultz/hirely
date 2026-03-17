'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, Trash2, Download, Loader2,
  FilePlus, AlertCircle, Eye, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn, formatFileSize, getDocumentLabel } from '@/lib/utils'

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

export default function DocumentsSection({ documents: initialDocuments, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [selectedType, setSelectedType] = useState('prontuario')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [documents, setDocuments] = useState(initialDocuments)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loadingUrls, setLoadingUrls] = useState(false)

  async function generateSignedUrls(docs: any[]) {
    if (docs.length === 0) return
    setLoadingUrls(true)
    try {
      const urls: Record<string, string> = {}
      await Promise.all(
        docs.map(async (doc) => {
          // Normalize: file_url can be a full URL (legacy) or a storage path
          let storagePath = doc.file_url
          if (storagePath.startsWith('http')) {
            const match = storagePath.match(/\/documents\/(.+?)(\?|$)/)
            storagePath = match ? decodeURIComponent(match[1]) : null
          }
          if (!storagePath) return

          const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(storagePath, 3600)
          if (!error && data?.signedUrl) {
            urls[doc.id] = data.signedUrl
          }
        })
      )
      setSignedUrls(urls)
    } finally {
      setLoadingUrls(false)
    }
  }

  async function fetchDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
    if (data) {
      setDocuments(data)
      await generateSignedUrls(data)
    }
  }

  // Load signed URLs on mount
  useEffect(() => {
    generateSignedUrls(initialDocuments)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]

    if (file.size > 10 * 1024 * 1024) {
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
      const storagePath = `${userId}/${Date.now()}_${selectedType}.${ext}`

      // 1. Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, { upsert: false })
      if (uploadError) throw uploadError

      // 2. Save record with storagePath (not public URL)
      const { error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        type: selectedType,
        file_name: file.name,
        file_url: storagePath,
        file_size: file.size,
      })
      if (dbError) throw dbError

      // 3. Update onboarding step on first doc
      if (documents.length === 0) {
        await supabase
          .from('profiles')
          .update({ onboarding_step: 'complete' })
          .eq('user_id', userId)
      }

      toast.success('Documento enviado com sucesso!')

      // 4. Refresh list client-side (no full reload needed)
      await fetchDocuments()
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
      let storagePath = doc.file_url
      if (storagePath.startsWith('http')) {
        const match = storagePath.match(/\/documents\/(.+?)(\?|$)/)
        storagePath = match ? decodeURIComponent(match[1]) : null
      }
      if (storagePath) {
        await supabase.storage.from('documents').remove([storagePath])
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id)
      if (error) throw error

      toast.success('Documento removido')
      await fetchDocuments()
      router.refresh()
    } catch {
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

        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
            dragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/40'
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
              <Upload size={32} className={dragging ? 'text-brand-400' : 'text-slate-500'} />
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">
            Documentos enviados
            {documents.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                {documents.length} arquivo{documents.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          {documents.length > 0 && (
            <button
              onClick={fetchDocuments}
              disabled={loadingUrls}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Atualizar lista"
            >
              <RefreshCw size={15} className={loadingUrls ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FileText size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum documento enviado ainda</p>
            <p className="text-slate-600 text-xs mt-1">
              Envie seus documentos após realizar o exame admissional
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => {
              const signedUrl = signedUrls[doc.id]
              return (
                <div key={doc.id} className="glass-card-hover p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2 py-0.5">
                        {getDocumentLabel(doc.type)}
                      </span>
                      <span className="text-xs text-slate-600">{formatFileSize(doc.file_size)}</span>
                      <span className="text-xs text-slate-600">
                        {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {loadingUrls ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Loader2 size={14} className="text-slate-600 animate-spin" />
                      </div>
                    ) : signedUrl ? (
                      <>
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                          title="Visualizar"
                        >
                          <Eye size={15} />
                        </a>
                        <a
                          href={signedUrl}
                          download={doc.file_name}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="Baixar"
                        >
                          <Download size={15} />
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={() => generateSignedUrls(documents)}
                        className="text-xs text-slate-600 hover:text-slate-400 px-2"
                        title="Recarregar links"
                      >
                        <RefreshCw size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      title="Remover"
                    >
                      {deletingId === doc.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Guide */}
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

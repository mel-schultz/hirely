import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Calendar, Upload, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-brand-700/5 rounded-full blur-3xl" />
        <div className="noise-bg absolute inset-0" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">H</span>
          </div>
          <span className="font-display text-xl font-bold text-white">hirely</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">
            Entrar
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2.5">
            Começar agora
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
          Processo de admissão digital
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Sua admissão,{' '}
          <span className="text-gradient">sem complicação</span>
        </h1>
        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          Gerencie todo o processo de admissão em um só lugar — desde o agendamento do exame médico até o envio dos documentos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-base w-full sm:w-auto justify-center">
            Iniciar minha admissão
            <ArrowRight size={18} />
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base w-full sm:w-auto text-center">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Steps preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, step: '01', title: 'Cadastro', desc: 'Crie sua conta em segundos' },
            { icon: Calendar, step: '02', title: 'Agendamento', desc: 'Agende seu exame admissional' },
            { icon: Upload, step: '03', title: 'Documentos', desc: 'Envie seus documentos preenchidos' },
            { icon: CheckCircle2, step: '04', title: 'Concluído', desc: 'Tudo pronto para começar' },
          ].map(({ icon: Icon, step, title, desc }, i) => (
            <div
              key={i}
              className="glass-card p-6 text-center opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 100 + 200}ms`, animationFillMode: 'forwards' }}
            >
              <div className="text-brand-500/40 font-mono text-xs mb-3">{step}</div>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-slate-800/50">
        © {new Date().getFullYear()} Hirely. Todos os direitos reservados.
      </footer>
    </main>
  )
}

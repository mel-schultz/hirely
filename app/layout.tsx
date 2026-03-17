import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hirely — Sua jornada de admissão simplificada',
  description:
    'Plataforma para gerenciar todo o processo de admissão: agendamento de exames, documentação e mais.',
  keywords: ['admissão', 'exame admissional', 'ASO', 'medicina do trabalho'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body bg-slate-950 text-white antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#052e16' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#2d1111' },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}

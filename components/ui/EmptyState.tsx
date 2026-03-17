import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-slate-600" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary inline-flex mt-4 text-sm py-2 px-5">
          {action.label}
        </Link>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar, Clock,
  MapPin, User, CheckCircle2, AlertCircle, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Appointment {
  id: string
  user_id: string
  clinic_name: string
  clinic_address: string
  clinic_phone?: string
  scheduled_date: string
  scheduled_time: string
  status: string
  notes?: string
}

interface Candidate {
  user_id: string
  full_name: string
  email: string
}

interface Props {
  appointments: Appointment[]
  candidates: Candidate[]
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const STATUS_STYLE: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: 'Pendente',   dot: 'bg-amber-400',  badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  confirmed: { label: 'Confirmado', dot: 'bg-brand-400',  badge: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
  completed: { label: 'Realizado',  dot: 'bg-blue-400',   badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  cancelled: { label: 'Cancelado',  dot: 'bg-red-400',    badge: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

// Color palette for candidates (Google Calendar style)
const CANDIDATE_COLORS = [
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-green-500/20 border-green-500/40 text-green-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  'bg-red-500/20 border-red-500/40 text-red-300',
]

export default function AppointmentsCalendar({ appointments, candidates }: Props) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(today)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [view, setView] = useState<'month' | 'list'>('month')

  // Map candidate colors
  const candidateColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    candidates.forEach((c, i) => {
      map[c.user_id] = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]
    })
    return map
  }, [candidates])

  // Group appointments by date string
  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    appointments.forEach(a => {
      const key = a.scheduled_date // 'YYYY-MM-DD'
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [appointments])

  // Calendar grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  // Next month padding
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
  }

  function toKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  function isToday(date: Date) {
    return toKey(date) === toKey(today)
  }

  function isSelected(date: Date) {
    return selectedDay ? toKey(date) === toKey(selectedDay) : false
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToday() {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDay(today)
  }

  const selectedKey = selectedDay ? toKey(selectedDay) : null
  const selectedAppts = selectedKey ? (apptsByDate[selectedKey] ?? []) : []

  // List view: all appointments sorted by date
  const sortedAppts = [...appointments].sort((a, b) =>
    a.scheduled_date.localeCompare(b.scheduled_date) ||
    a.scheduled_time.localeCompare(b.scheduled_time)
  )

  // Upcoming (today or future)
  const todayKey = toKey(today)
  const upcomingAppts = sortedAppts.filter(a => a.scheduled_date >= todayKey)
  const pastAppts = sortedAppts.filter(a => a.scheduled_date < todayKey)

  function getCandidateName(userId: string) {
    return candidates.find(c => c.user_id === userId)?.full_name ?? 'Candidato'
  }

  function getCandidateEmail(userId: string) {
    return candidates.find(c => c.user_id === userId)?.email ?? ''
  }

  function ApptCard({ appt, showDate = false }: { appt: Appointment; showDate?: boolean }) {
    const status = STATUS_STYLE[appt.status] ?? STATUS_STYLE.pending
    const color = candidateColorMap[appt.user_id] ?? CANDIDATE_COLORS[0]
    const name = getCandidateName(appt.user_id)
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()

    return (
      <button
        onClick={() => setSelectedAppt(appt)}
        className={cn(
          'w-full text-left p-3 rounded-xl border transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]',
          color
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate">{name}</p>
              <span className={cn('text-xs border rounded-full px-2 py-0.5 flex-shrink-0', status.badge)}>
                {status.label}
              </span>
            </div>
            {showDate && (
              <p className="text-xs opacity-70 mt-0.5">
                {new Date(appt.scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'short', day: '2-digit', month: 'short'
                })}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 opacity-80">
              <span className="flex items-center gap-1 text-xs">
                <Clock size={10} /> {appt.scheduled_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1 text-xs truncate">
                <MapPin size={10} /> {appt.clinic_name}
              </span>
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Calendar size={15} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Agenda de Exames</h3>
            <p className="text-slate-500 text-xs">{appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} no total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'month' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      <div className={cn('flex', view === 'list' ? 'flex-col' : 'flex-col lg:flex-row')}>

        {/* ── MONTH VIEW ───────────────────────────────────── */}
        {view === 'month' && (
          <>
            <div className="flex-1 p-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h4 className="text-white font-semibold text-sm min-w-[140px] text-center">
                    {MONTHS[month]} {year}
                  </h4>
                  <button
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <button
                  onClick={goToday}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium border border-brand-500/30 hover:border-brand-500/50 px-3 py-1.5 rounded-lg transition-all"
                >
                  Hoje
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-600 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map(({ date, isCurrentMonth }, i) => {
                  const key = toKey(date)
                  const dayAppts = apptsByDate[key] ?? []
                  const hasAppts = dayAppts.length > 0
                  const todayCell = isToday(date)
                  const selectedCell = isSelected(date)

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(date)}
                      className={cn(
                        'relative aspect-square sm:aspect-auto sm:h-12 lg:h-14 rounded-xl p-1 flex flex-col items-center justify-start transition-all duration-150',
                        !isCurrentMonth && 'opacity-25',
                        selectedCell && 'bg-brand-500/20 ring-1 ring-brand-500/50',
                        !selectedCell && todayCell && 'bg-slate-800/80',
                        !selectedCell && !todayCell && 'hover:bg-slate-800/60',
                      )}
                    >
                      <span className={cn(
                        'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                        todayCell ? 'bg-brand-500 text-white font-bold' : 'text-slate-300',
                        selectedCell && !todayCell && 'text-brand-300',
                      )}>
                        {date.getDate()}
                      </span>
                      {/* Appointment dots */}
                      {hasAppts && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                          {dayAppts.slice(0, 3).map((a, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                STATUS_STYLE[a.status]?.dot ?? 'bg-slate-400'
                              )}
                            />
                          ))}
                          {dayAppts.length > 3 && (
                            <span className="text-slate-500 text-[9px] leading-none">+{dayAppts.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-800/50">
                {Object.entries(STATUS_STYLE).map(([, s]) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', s.dot)} />
                    <span className="text-slate-500 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day panel */}
            <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-700/50 p-4">
              <div className="mb-3">
                <p className="text-white font-semibold text-sm">
                  {selectedDay
                    ? selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Selecione um dia'}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {selectedAppts.length === 0
                    ? 'Nenhum agendamento'
                    : `${selectedAppts.length} agendamento${selectedAppts.length > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedAppts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar size={28} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-600 text-xs">Dia livre</p>
                  </div>
                ) : (
                  selectedAppts
                    .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                    .map(appt => <ApptCard key={appt.id} appt={appt} />)
                )}
              </div>
            </div>
          </>
        )}

        {/* ── LIST VIEW ────────────────────────────────────── */}
        {view === 'list' && (
          <div className="p-4 space-y-6">
            {appointments.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar size={36} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Nenhum agendamento ainda</p>
              </div>
            ) : (
              <>
                {upcomingAppts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                      Próximos — {upcomingAppts.length}
                    </p>
                    <div className="space-y-2">
                      {upcomingAppts.map(a => <ApptCard key={a.id} appt={a} showDate />)}
                    </div>
                  </div>
                )}
                {pastAppts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">
                      Anteriores — {pastAppts.length}
                    </p>
                    <div className="space-y-2 opacity-60">
                      {pastAppts.map(a => <ApptCard key={a.id} appt={a} showDate />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ─────────────────────────────────── */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAppt(null)} />
          <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-fade-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                  candidateColorMap[selectedAppt.user_id] ?? CANDIDATE_COLORS[0]
                )}>
                  {getCandidateName(selectedAppt.user_id).split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{getCandidateName(selectedAppt.user_id)}</p>
                  <p className="text-slate-500 text-xs">{getCandidateEmail(selectedAppt.user_id)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: Calendar,
                  label: 'Data',
                  value: new Date(selectedAppt.scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })
                },
                { icon: Clock, label: 'Horário', value: selectedAppt.scheduled_time.slice(0, 5) + 'h' },
                { icon: MapPin, label: 'Clínica', value: selectedAppt.clinic_name },
                { icon: MapPin, label: 'Endereço', value: selectedAppt.clinic_address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl">
                  <Icon size={15} className="text-brand-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">{label}</p>
                    <p className="text-white text-sm mt-0.5 capitalize">{value}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl">
                <CheckCircle2 size={15} className="text-brand-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Status</p>
                  <span className={cn(
                    'inline-block text-xs font-medium border rounded-full px-2.5 py-0.5 mt-0.5',
                    STATUS_STYLE[selectedAppt.status]?.badge ?? STATUS_STYLE.pending.badge
                  )}>
                    {STATUS_STYLE[selectedAppt.status]?.label ?? 'Pendente'}
                  </span>
                </div>
              </div>

              {selectedAppt.notes && (
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1">Observações</p>
                  <p className="text-slate-300 text-sm">{selectedAppt.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

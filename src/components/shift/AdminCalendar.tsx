import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Shift } from '../../lib/types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function AdminCalendar({
  year,
  month,
  shifts,
  onPrev,
  onNext,
}: {
  year: number
  month: number
  shifts: Shift[]
  onPrev: () => void
  onNext: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDay = new Date(year, month, 0).getDate()
  const startDow = new Date(year, month - 1, 1).getDay()

  // Build day map: dateStr -> [{name, status}]
  const dayMap = useMemo(() => {
    const map: Record<string, { name: string; status: string }[]> = {}
    shifts.forEach((s) =>
      s.dates.forEach((d) => {
        const [y, m] = d.split('-')
        if (parseInt(y) === year && parseInt(m) === month) {
          if (!map[d]) map[d] = []
          map[d].push({ name: s.worker_name, status: s.status })
        }
      })
    )
    return map
  }, [shifts, year, month])

  const emptyCells = Array.from({ length: startDow }, (_, i) => (
    <div key={`empty-${i}`} />
  ))

  const dayCells = Array.from({ length: lastDay }, (_, i) => {
    const d = i + 1
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = new Date(year, month - 1, d).getTime() === today.getTime()
    const entries = dayMap[key] || []

    return (
      <div
        key={key}
        className={`min-h-[48px] rounded-lg bg-white border p-1 overflow-hidden ${
          isToday ? 'border-mango bg-mango-light' : 'border-border'
        }`}
      >
        <div className="text-[10px] font-bold text-muted">{d}</div>
        {entries.map((e, j) => (
          <div
            key={j}
            className={`text-[8px] rounded px-0.5 mt-0.5 truncate ${
              e.status === 'approved'
                ? 'bg-green-light text-green'
                : e.status === 'rejected'
                  ? 'bg-red-light text-red line-through'
                  : 'bg-mango-light text-mango-dark'
            }`}
          >
            {e.name.charAt(0)}
          </div>
        ))}
      </div>
    )
  })

  return (
    <div className="bg-white rounded-2xl border border-border p-6 mb-6">
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        カレンダー
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-muted" />
        </button>
        <span className="font-bold text-ink">
          {year}年{month}月
        </span>
        <button
          type="button"
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[10px] font-bold py-1 ${
              i === 0 ? 'text-red' : i === 6 ? 'text-blue-500' : 'text-muted'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {emptyCells}
        {dayCells}
      </div>
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  year: number
  month: number
  selectedDays: Set<string>
  onToggleDay: (dateStr: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function Calendar({
  year,
  month,
  selectedDays,
  onToggleDay,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDay = new Date(year, month, 0).getDate()
  const startDow = new Date(year, month - 1, 1).getDay()

  const emptyCells = Array.from({ length: startDow }, (_, i) => (
    <div key={`empty-${i}`} />
  ))

  const dayCells = Array.from({ length: lastDay }, (_, i) => {
    const d = i + 1
    const date = new Date(year, month - 1, d)
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = date.getDay()
    const isPast = date < today
    const isSelected = selectedDays.has(key)
    const isToday = date.getTime() === today.getTime()

    const colorClass =
      isSelected
        ? 'bg-mango text-white font-bold'
        : dow === 0
          ? 'text-red'
          : dow === 6
            ? 'text-blue-500'
            : 'text-ink'

    return (
      <button
        key={key}
        type="button"
        disabled={isPast}
        onClick={() => !isPast && onToggleDay(key)}
        className={`
          aspect-square rounded-full flex items-center justify-center text-sm font-medium
          transition-all duration-150 cursor-pointer
          ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-mango-light'}
          ${colorClass}
          ${isToday ? 'ring-2 ring-mango' : ''}
        `}
      >
        {d}
      </button>
    )
  })

  return (
    <div className="rounded-xl border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-muted" />
        </button>
        <span className="text-base font-bold text-ink">
          {year}年{month}月
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-bold py-1 ${
              i === 0 ? 'text-red' : i === 6 ? 'text-blue-500' : 'text-muted'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>
    </div>
  )
}

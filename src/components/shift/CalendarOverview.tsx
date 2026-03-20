import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../../store/useStore'

type CalendarData = {
  shiftDays: Map<string, 'pending' | 'approved' | 'rejected'>
  attendanceDays: Map<string, { total: number; status: string }>
  absenceDays: Map<string, 'pending' | 'approved' | 'rejected'>
}

export default function CalendarOverview() {
  const loggedInWorker = useStore((s) => s.loggedInWorker)
  const shifts = useStore((s) => s.shifts)
  const records = useStore((s) => s.records)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  // Build day data maps for the overview calendar
  const calendarData: CalendarData = useMemo(() => {
    if (!loggedInWorker) return { shiftDays: new Map(), attendanceDays: new Map(), absenceDays: new Map() }

    const shiftDays = new Map<string, 'pending' | 'approved' | 'rejected'>()
    const absenceDays = new Map<string, 'pending' | 'approved' | 'rejected'>()
    const attendanceDays = new Map<string, { total: number; status: string }>()

    // Shift & absence data
    shifts
      .filter((s) => s.worker_name === loggedInWorker.name)
      .forEach((s) => {
        const map = s.type === 'absence' ? absenceDays : shiftDays
        s.dates.forEach((d) => {
          // Keep the "best" status: approved > pending > rejected
          const existing = map.get(d)
          if (!existing || s.status === 'approved' || (s.status === 'pending' && existing === 'rejected')) {
            map.set(d, s.status)
          }
        })
      })

    // Attendance data (work records)
    records
      .filter((r) => r.worker_name === loggedInWorker.name)
      .forEach((r) => {
        attendanceDays.set(r.date, { total: r.total, status: r.status })
      })

    return { shiftDays, attendanceDays, absenceDays }
  }, [loggedInWorker, shifts, records])

  if (!loggedInWorker) return null

  const monthKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const monthRecords = records.filter(
    (r) => r.worker_name === loggedInWorker.name && r.date.startsWith(monthKey)
  )
  const monthShiftDays = Array.from(calendarData.shiftDays.entries())
    .filter(([d]) => d.startsWith(monthKey))
  const monthAbsenceDays = Array.from(calendarData.absenceDays.entries())
    .filter(([d]) => d.startsWith(monthKey))
  const totalAmount = monthRecords.reduce((sum, r) => sum + r.total, 0)

  return (
    <div className="space-y-4">
      {/* Overview Calendar */}
      <div className="rounded-xl border border-border p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewMonth((m) => (m === 1 ? (setViewYear((y) => y - 1), 12) : m - 1))}
            className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-muted" />
          </button>
          <span className="text-base font-bold text-ink">
            {viewYear}年{viewMonth}月
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => (m === 12 ? (setViewYear((y) => y + 1), 1) : m + 1))}
            className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((w, i) => (
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
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for start of month */}
          {Array.from({ length: new Date(viewYear, viewMonth - 1, 1).getDay() }, (_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {/* Day cells */}
          {Array.from({ length: new Date(viewYear, viewMonth, 0).getDate() }, (_, i) => {
            const d = i + 1
            const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const date = new Date(viewYear, viewMonth - 1, d)
            const dow = date.getDay()
            const isToday = key === new Date().toISOString().split('T')[0]

            const shiftStatus = calendarData.shiftDays.get(key)
            const attendance = calendarData.attendanceDays.get(key)
            const absenceStatus = calendarData.absenceDays.get(key)

            // Background color based on shift status
            let bgClass = ''
            if (absenceStatus) {
              bgClass = absenceStatus === 'approved' ? 'bg-red-100' : absenceStatus === 'pending' ? 'bg-red-50' : ''
            } else if (attendance) {
              bgClass = 'bg-green-100'
            } else if (shiftStatus === 'approved') {
              bgClass = 'bg-mango-light'
            } else if (shiftStatus === 'pending') {
              bgClass = 'bg-yellow-50'
            }

            const textClass = dow === 0 ? 'text-red' : dow === 6 ? 'text-blue-500' : 'text-ink'

            return (
              <div
                key={key}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative text-xs
                  ${bgClass} ${isToday ? 'ring-2 ring-mango' : ''}`}
              >
                <span className={`font-medium ${textClass}`}>{d}</span>
                {/* Status dots */}
                <div className="flex gap-0.5 mt-0.5">
                  {shiftStatus && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      shiftStatus === 'approved' ? 'bg-mango' : shiftStatus === 'pending' ? 'bg-yellow-400' : 'bg-gray-300'
                    }`} />
                  )}
                  {attendance && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      attendance.status === 'approved' ? 'bg-green-500' : 'bg-green-300'
                    }`} />
                  )}
                  {absenceStatus && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      absenceStatus === 'approved' ? 'bg-red-500' : 'bg-red-300'
                    }`} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="text-xs font-bold text-muted mb-2">凡例</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-mango" />
            <span className="text-xs text-ink">シフト予定（承認済）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs text-ink">シフト予定（審査中）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-ink">出勤済み（承認済）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-300" />
            <span className="text-xs text-ink">出勤済み（保留）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-ink">欠勤（承認済）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-300" />
            <span className="text-xs text-ink">欠勤（審査中）</span>
          </div>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="text-xs font-bold text-muted mb-3">{viewMonth}月のまとめ</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-black text-mango-dark font-mono">{monthShiftDays.length}</div>
            <div className="text-[10px] text-muted">シフト予定</div>
          </div>
          <div>
            <div className="text-2xl font-black text-green-600 font-mono">{monthRecords.length}</div>
            <div className="text-[10px] text-muted">出勤日数</div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-500 font-mono">{monthAbsenceDays.length}</div>
            <div className="text-[10px] text-muted">欠勤</div>
          </div>
        </div>
        {totalAmount > 0 && (
          <div className="mt-3 pt-3 border-t border-border text-center">
            <div className="text-xs text-muted">合計金額</div>
            <div className="text-xl font-black text-mango-dark font-mono">¥{totalAmount.toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Calendar from '../components/shift/Calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  CalendarDays,
  FileText,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Send,
  Eye,
} from 'lucide-react'

type Tab = 'calendar' | 'request' | 'submitted' | 'absence'

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const config = {
    pending: { label: '審査中', cls: 'bg-mango/15 text-mango-dark' },
    approved: { label: '承認済', cls: 'bg-green-100 text-green-700' },
    rejected: { label: '却下', cls: 'bg-red-100 text-red-600' },
  }
  const { label, cls } = config[status]
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {label}
    </span>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function MyShifts() {
  const loggedInWorker = useStore((s) => s.loggedInWorker)
  const shifts = useStore((s) => s.shifts)
  const addShift = useStore((s) => s.addShift)
  const updateShift = useStore((s) => s.updateShift)
  const deleteShift = useStore((s) => s.deleteShift)
  const showToast = useStore((s) => s.showToast)

  const records = useStore((s) => s.records)
  const [activeTab, setActiveTab] = useState<Tab>('calendar')

  // --- Shift Request tab state ---
  const nextMonth = useMemo(() => {
    const now = new Date()
    return { year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), month: now.getMonth() + 2 }
  }, [])
  const [calYear, setCalYear] = useState(nextMonth.year)
  const [calMonth, setCalMonth] = useState(nextMonth.month)
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  // --- Calendar overview tab state ---
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  // Build day data maps for the overview calendar
  const calendarData = useMemo(() => {
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

  // --- Absence tab state ---
  const [absenceDate, setAbsenceDate] = useState('')
  const [absenceReason, setAbsenceReason] = useState('')
  const [absenceSubmitting, setAbsenceSubmitting] = useState(false)

  // --- Edit modal state ---
  const [editingShift, setEditingShift] = useState<number | null>(null)
  const [editDays, setEditDays] = useState<Set<string>>(new Set())
  const [editCalYear, setEditCalYear] = useState(nextMonth.year)
  const [editCalMonth, setEditCalMonth] = useState(nextMonth.month)
  const [editSaving, setEditSaving] = useState(false)

  if (!loggedInWorker) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted">
        ログインしてください
      </div>
    )
  }

  const myShifts = shifts
    .filter((s) => s.worker_name === loggedInWorker.name)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())

  // --- Handlers ---
  const handleToggleDay = (dateStr: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) next.delete(dateStr)
      else next.add(dateStr)
      return next
    })
  }

  const handleSubmitShift = async () => {
    if (selectedDays.size === 0) {
      showToast('日付を選択してください', 'error')
      return
    }
    setSubmitting(true)
    try {
      await addShift({
        worker_name: loggedInWorker.name,
        dates: Array.from(selectedDays).sort(),
        submitted_at: new Date().toISOString(),
        status: 'pending',
        type: 'shift',
        reason: '',
      })
      showToast('シフト希望を提出しました', 'success')
      setSelectedDays(new Set())
      setActiveTab('submitted')
    } catch {
      showToast('提出に失敗しました', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAbsence = async () => {
    if (!absenceDate) {
      showToast('日付を選択してください', 'error')
      return
    }
    if (!absenceReason.trim()) {
      showToast('理由を入力してください', 'error')
      return
    }
    setAbsenceSubmitting(true)
    try {
      await addShift({
        worker_name: loggedInWorker.name,
        dates: [absenceDate],
        submitted_at: new Date().toISOString(),
        status: 'pending',
        type: 'absence',
        reason: absenceReason.trim(),
      })
      showToast('欠勤届を提出しました', 'success')
      setAbsenceDate('')
      setAbsenceReason('')
      setActiveTab('submitted')
    } catch {
      showToast('提出に失敗しました', 'error')
    } finally {
      setAbsenceSubmitting(false)
    }
  }

  const openEditModal = (shiftId: number) => {
    const shift = shifts.find((s) => s.id === shiftId)
    if (!shift) return
    setEditingShift(shiftId)
    setEditDays(new Set(shift.dates))
    // Set calendar to the month of the first date
    if (shift.dates.length > 0) {
      const [y, m] = shift.dates[0].split('-').map(Number)
      setEditCalYear(y)
      setEditCalMonth(m)
    }
  }

  const handleEditSave = async () => {
    if (editingShift === null) return
    if (editDays.size === 0) {
      showToast('日付を選択してください', 'error')
      return
    }
    setEditSaving(true)
    try {
      await updateShift(editingShift, { dates: Array.from(editDays).sort() })
      showToast('シフトを更新しました', 'success')
      setEditingShift(null)
    } catch {
      showToast('更新に失敗しました', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このシフトを取り消しますか？')) return
    try {
      await deleteShift(id)
      showToast('シフトを取り消しました', 'success')
    } catch {
      showToast('取り消しに失敗しました', 'error')
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'calendar', label: 'カレンダー', icon: <Eye className="w-4 h-4" /> },
    { key: 'request', label: 'シフト希望', icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'submitted', label: '提出済み', icon: <FileText className="w-4 h-4" /> },
    { key: 'absence', label: '欠勤届', icon: <AlertCircle className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold transition-colors cursor-pointer
              ${activeTab === tab.key
                ? 'text-mango-dark border-b-2 border-mango'
                : 'text-muted hover:text-ink'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'calendar' && (
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
          {(() => {
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
            )
          })()}
        </div>
      )}

      {activeTab === 'request' && (
        <div className="space-y-4">
          <Calendar
            year={calYear}
            month={calMonth}
            selectedDays={selectedDays}
            onToggleDay={handleToggleDay}
            onPrevMonth={() => {
              setCalMonth((m) => (m === 1 ? (setCalYear((y) => y - 1), 12) : m - 1))
            }}
            onNextMonth={() => {
              setCalMonth((m) => (m === 12 ? (setCalYear((y) => y + 1), 1) : m + 1))
            }}
          />

          {selectedDays.size > 0 && (
            <p className="text-sm text-muted text-center">
              {selectedDays.size}日選択中
            </p>
          )}

          <button
            type="button"
            disabled={submitting || selectedDays.size === 0}
            onClick={handleSubmitShift}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-mango text-white font-bold text-sm
              hover:bg-mango-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {submitting ? '提出中...' : 'シフト希望を提出'}
          </button>
        </div>
      )}

      {activeTab === 'submitted' && (
        <div className="space-y-3">
          {myShifts.length === 0 ? (
            <p className="text-center text-muted py-12 text-sm">提出済みのシフトはありません</p>
          ) : (
            myShifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white rounded-xl border border-border shadow-sm p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shift.type === 'absence' && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        欠勤届
                      </span>
                    )}
                    <StatusBadge status={shift.status} />
                  </div>
                  <span className="text-xs text-muted">
                    {formatDate(shift.submitted_at)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {shift.dates.map((d) => (
                    <span
                      key={d}
                      className="text-xs bg-mango-light text-mango-dark px-2 py-0.5 rounded-md font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {shift.type === 'absence' && shift.reason && (
                  <p className="text-sm text-ink bg-gray-50 rounded-lg p-2">
                    {shift.reason}
                  </p>
                )}

                {shift.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    {shift.type === 'shift' && (
                      <button
                        type="button"
                        onClick={() => openEditModal(shift.id)}
                        className="flex items-center gap-1 text-xs font-bold text-mango-dark hover:text-mango
                          px-3 py-1.5 rounded-lg border border-mango/30 hover:bg-mango-light transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        編集
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(shift.id)}
                      className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600
                        px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      取り消し
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'absence' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">日付</label>
            <input
              type="date"
              value={absenceDate}
              onChange={(e) => setAbsenceDate(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink
                focus:outline-none focus:ring-2 focus:ring-mango/40 focus:border-mango"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1">理由 <span className="text-red text-xs">（必須）</span></label>
            <textarea
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              placeholder="欠勤の理由を記入してください"
              rows={4}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink resize-none
                focus:outline-none focus:ring-2 focus:ring-mango/40 focus:border-mango"
            />
          </div>

          <button
            type="button"
            disabled={absenceSubmitting || !absenceDate || !absenceReason.trim()}
            onClick={handleSubmitAbsence}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-mango text-white font-bold text-sm
              hover:bg-mango-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {absenceSubmitting ? '提出中...' : '欠勤届を提出'}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingShift !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">シフト日程を編集</h3>
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <Calendar
              year={editCalYear}
              month={editCalMonth}
              selectedDays={editDays}
              onToggleDay={(dateStr) => {
                setEditDays((prev) => {
                  const next = new Set(prev)
                  if (next.has(dateStr)) next.delete(dateStr)
                  else next.add(dateStr)
                  return next
                })
              }}
              onPrevMonth={() => {
                setEditCalMonth((m) => (m === 1 ? (setEditCalYear((y) => y - 1), 12) : m - 1))
              }}
              onNextMonth={() => {
                setEditCalMonth((m) => (m === 12 ? (setEditCalYear((y) => y + 1), 1) : m + 1))
              }}
            />

            {editDays.size > 0 && (
              <p className="text-sm text-muted text-center">{editDays.size}日選択中</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-muted
                  hover:bg-gray-50 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={editSaving || editDays.size === 0}
                onClick={handleEditSave}
                className="flex-1 py-2.5 rounded-xl bg-mango text-white text-sm font-bold
                  hover:bg-mango-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {editSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

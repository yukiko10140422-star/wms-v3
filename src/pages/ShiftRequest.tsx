import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Calendar from '../components/shift/Calendar'
import Button from '../components/ui/Button'

export default function ShiftRequest() {
  const { workers, addShift, showToast } = useStore()

  const now = new Date()
  const defaultMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2
  const defaultYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()

  const [selectedWorker, setSelectedWorker] = useState('')
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const handleToggleDay = (dateStr: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) {
        next.delete(dateStr)
      } else {
        next.add(dateStr)
      }
      return next
    })
  }

  const sortedDays = useMemo(
    () => [...selectedDays].sort(),
    [selectedDays]
  )

  const handleSubmit = async () => {
    if (!selectedWorker) {
      showToast('名前を選んでください', 'error')
      return
    }
    if (selectedDays.size === 0) {
      showToast('希望日を選んでください', 'error')
      return
    }

    setLoading(true)
    await addShift({
      worker_name: selectedWorker,
      dates: sortedDays,
      submitted_at: new Date().toISOString(),
      status: 'pending',
      type: 'shift',
      reason: '',
    })
    setLoading(false)
    setSubmitted(true)
    setSelectedDays(new Set())

    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-ink">シフト希望を出す</h2>
        <p className="text-sm text-muted mt-1">
          来月の出勤希望日を選んで提出してください
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
          お名前を選んでください
        </div>

        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm mb-6 focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
        >
          <option value="">-- 名前を選ぶ --</option>
          {workers.map((w) => (
            <option key={w.id} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>

        <Calendar
          year={year}
          month={month}
          selectedDays={selectedDays}
          onToggleDay={handleToggleDay}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-sm text-muted mb-2">
            選択した日：
            <span className="font-bold text-ink">{selectedDays.size}日</span>
          </div>
          {sortedDays.length > 0 && (
            <div className="text-xs text-muted mb-4">
              {sortedDays.map((d) => parseInt(d.split('-')[2]) + '日').join(' / ')}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full"
          >
            希望を提出する
          </Button>
        </div>
      </div>

      {submitted && (
        <div className="bg-green-light border border-green/30 rounded-xl p-4 text-green font-bold text-sm">
          提出しました！ありがとうございます。
        </div>
      )}
    </div>
  )
}

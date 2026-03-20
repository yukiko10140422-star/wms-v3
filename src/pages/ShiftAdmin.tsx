import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import AdminCalendar from '../components/shift/AdminCalendar'
import ShiftList from '../components/shift/ShiftList'

export default function ShiftAdmin() {
  const { shifts, workers, updateShiftStatus, deleteShift, showToast } = useStore()

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1)
  const [filterWorker, setFilterWorker] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const handleCalPrev = () => {
    if (calMonth === 1) {
      setCalMonth(12)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  const handleCalNext = () => {
    if (calMonth === 12) {
      setCalMonth(1)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  const filteredShifts = useMemo(() => {
    let list = shifts
    if (filterWorker) list = list.filter((s) => s.worker_name === filterWorker)
    if (filterStatus) list = list.filter((s) => s.status === filterStatus)
    return list
  }, [shifts, filterWorker, filterStatus])

  const workerNames = useMemo(
    () => [...new Set(shifts.map((s) => s.worker_name))],
    [shifts]
  )

  const handleApprove = async (id: number) => {
    await updateShiftStatus(id, 'approved')
  }

  const handleReject = async (id: number) => {
    await updateShiftStatus(id, 'rejected')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteShift(id)
    showToast('シフトを削除しました', 'success')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-ink">シフト管理</h2>
        <p className="text-sm text-muted mt-1">
          希望を確認・承認・却下できます
        </p>
      </div>

      <AdminCalendar
        year={calYear}
        month={calMonth}
        shifts={shifts}
        onPrev={handleCalPrev}
        onNext={handleCalNext}
      />

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
          一覧
        </div>

        <div className="flex gap-3 flex-wrap mb-4">
          <select
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
          >
            <option value="">全員</option>
            {workerNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
          >
            <option value="">全ステータス</option>
            <option value="pending">未確認</option>
            <option value="approved">承認済み</option>
            <option value="rejected">却下</option>
          </select>
        </div>

        <ShiftList
          shifts={filteredShifts}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

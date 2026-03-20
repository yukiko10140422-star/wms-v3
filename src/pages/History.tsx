import { useState, useMemo, useCallback } from 'react'
import { useStore } from '../store/useStore'
import MonthSummary from '../components/history/MonthSummary'
import WorkerChart from '../components/history/WorkerChart'
import RecordList from '../components/history/RecordList'
import PaymentDoc from '../components/print/PaymentDoc'
import Button from '../components/ui/Button'
import { Printer, Download, CheckCheck, XCircle } from 'lucide-react'

export default function History() {
  const {
    records,
    workers,
    settings,
    adminUnlocked,
    updateRecordStatus,
    deleteRecord,
    showToast,
  } = useStore()

  const [filterMonth, setFilterMonth] = useState('')
  const [filterWorker, setFilterWorker] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc')
  const [showPrint, setShowPrint] = useState(false)
  const [printRecords, setPrintRecords] = useState<typeof records | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const workerNames = useMemo(
    () => [...new Set(records.map((r) => r.worker_name))],
    [records]
  )

  const filteredRecords = useMemo(() => {
    let list = records
    if (filterMonth) list = list.filter((r) => r.date.startsWith(filterMonth))
    if (filterWorker) list = list.filter((r) => r.worker_name === filterWorker)
    if (filterStatus) list = list.filter((r) => r.status === filterStatus)

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return a.date.localeCompare(b.date)
        case 'total-desc': return b.total - a.total
        case 'total-asc': return a.total - b.total
        default: return b.date.localeCompare(a.date)
      }
    })

    return list
  }, [records, filterMonth, filterWorker, filterStatus, sortBy])

  const handleApprove = useCallback(
    async (id: number) => {
      await updateRecordStatus(id, 'approved')
    },
    [updateRecordStatus]
  )

  const handleReject = useCallback(
    async (id: number) => {
      await updateRecordStatus(id, 'rejected')
    },
    [updateRecordStatus]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm('削除しますか？')) return
      await deleteRecord(id)
    },
    [deleteRecord]
  )

  const handlePrint = useCallback(
    (id: number) => {
      const record = records.find((r) => r.id === id)
      if (record) {
        setPrintRecords([record])
        setShowPrint(true)
      }
    },
    [records]
  )

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    const pendingIds = filteredRecords.filter((r) => r.status === 'pending').map((r) => r.id)
    setSelectedIds((prev) => {
      const allSelected = pendingIds.every((id) => prev.has(id))
      return allSelected ? new Set() : new Set(pendingIds)
    })
  }, [filteredRecords])

  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`${selectedIds.size}件を承認しますか？`)) return
    setBulkProcessing(true)
    await Promise.all([...selectedIds].map((id) => updateRecordStatus(id, 'approved')))
    setSelectedIds(new Set())
    setBulkProcessing(false)
    showToast(`${selectedIds.size}件を承認しました`, 'success')
  }, [selectedIds, updateRecordStatus, showToast])

  const handleBulkReject = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`${selectedIds.size}件を却下しますか？`)) return
    setBulkProcessing(true)
    await Promise.all([...selectedIds].map((id) => updateRecordStatus(id, 'rejected')))
    setSelectedIds(new Set())
    setBulkProcessing(false)
    showToast(`${selectedIds.size}件を却下しました`, 'info')
  }, [selectedIds, updateRecordStatus, showToast])

  const pendingInView = useMemo(
    () => filteredRecords.filter((r) => r.status === 'pending').length,
    [filteredRecords]
  )

  const handleOpenPrintPreview = () => {
    if (!filterMonth) {
      showToast('月を選択してください', 'error')
      return
    }
    if (!filterWorker) {
      showToast('作業者を選択してください', 'error')
      return
    }
    if (!filteredRecords.length) {
      showToast('対象の記録がありません', 'error')
      return
    }
    setPrintRecords(filteredRecords)
    setShowPrint(true)
  }

  const exportCSV = () => {
    if (!filteredRecords.length) {
      showToast('対象の記録がありません', 'error')
      return
    }

    const rows: string[][] = [
      ['作業日', '名前', '住所', 'ステータス', '加工の種類', '単価', '数量', '小計', '上乗せ', '合計', '備考'],
    ]

    filteredRecords.forEach((r) => {
      r.items.forEach((it, i) => {
        rows.push([
          r.date,
          r.worker_name,
          r.address || '',
          r.status || 'pending',
          it.name,
          String(it.price),
          it.isHourly ? `${it.qty}h` : String(it.qty),
          String(it.sub),
          i === 0 ? (r.bonus_on ? '有' : '無') : '',
          i === 0 ? String(r.total) : '',
          i === 0 ? r.remarks || '' : '',
        ])
      })
    })

    const bom = '\uFEFF'
    const csv =
      bom +
      rows
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `WMS_${filterMonth || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const printTitle = useMemo(() => {
    if (printRecords && printRecords.length === 1 && !filterMonth) {
      return printRecords[0].date
    }
    if (!filterMonth) return ''
    const [y, m] = filterMonth.split('-')
    return `${y}年${parseInt(m)}月分`
  }, [filterMonth, printRecords])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-ink">履歴・明細書</h2>
        <p className="text-sm text-muted mt-1">
          提出された記録の確認・承認・明細書の発行
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        <div className="flex flex-col gap-1 min-w-[145px]">
          <label className="text-xs font-bold text-muted">月で絞り込み</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs font-bold text-muted">名前</label>
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
        </div>

        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-xs font-bold text-muted">ステータス</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
          >
            <option value="">すべて</option>
            <option value="pending">保留</option>
            <option value="approved">承認</option>
            <option value="rejected">却下</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs font-bold text-muted">並び替え</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
          >
            <option value="date-desc">日付（新しい順）</option>
            <option value="date-asc">日付（古い順）</option>
            <option value="total-desc">金額（高い順）</option>
            <option value="total-asc">金額（低い順）</option>
          </select>
        </div>

        <div className="flex gap-2 mt-auto">
          <Button variant="primary" size="md" onClick={handleOpenPrintPreview}>
            <Printer className="w-4 h-4" />
            請求書
          </Button>
          <Button variant="secondary" size="md" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {adminUnlocked && pendingInView > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-4 bg-mango-light/30 border border-mango/20 rounded-xl px-4 py-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={pendingInView > 0 && filteredRecords.filter((r) => r.status === 'pending').every((r) => selectedIds.has(r.id))}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-mango rounded"
            />
            <span className="font-bold text-ink">全選択 ({pendingInView}件)</span>
          </label>
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-muted">{selectedIds.size}件選択中</span>
              <div className="flex gap-2 ml-auto">
                <Button variant="success" size="sm" loading={bulkProcessing} onClick={handleBulkApprove}>
                  <CheckCheck className="w-4 h-4" />
                  一括承認
                </Button>
                <Button variant="secondary" size="sm" loading={bulkProcessing} onClick={handleBulkReject}>
                  <XCircle className="w-4 h-4" />
                  一括却下
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Worker Chart */}
      {filteredRecords.length > 0 && (
        <WorkerChart records={filteredRecords} filterMonth={filterMonth} />
      )}

      {/* Month Summary */}
      {filterMonth && filteredRecords.length > 0 && (
        <MonthSummary records={filteredRecords} />
      )}

      {/* Record List */}
      <RecordList
        records={filteredRecords}
        adminUnlocked={adminUnlocked}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onPrint={handlePrint}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {/* Print Preview */}
      {showPrint && settings && printRecords && (
        <PaymentDoc
          records={printRecords}
          settings={settings}
          workers={workers}
          title={printTitle}
          onClose={() => { setShowPrint(false); setPrintRecords(null) }}
        />
      )}
    </div>
  )
}

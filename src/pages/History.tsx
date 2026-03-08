import { useState, useMemo, useCallback } from 'react'
import { useStore } from '../store/useStore'
import MonthSummary from '../components/history/MonthSummary'
import RecordList from '../components/history/RecordList'
import PaymentDoc from '../components/print/PaymentDoc'
import Button from '../components/ui/Button'
import { Printer, Download } from 'lucide-react'

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
  const [showPrint, setShowPrint] = useState(false)

  const workerNames = useMemo(
    () => [...new Set(records.map((r) => r.worker_name))],
    [records]
  )

  const filteredRecords = useMemo(() => {
    let list = records
    if (filterMonth) list = list.filter((r) => r.date.startsWith(filterMonth))
    if (filterWorker) list = list.filter((r) => r.worker_name === filterWorker)
    return list
  }, [records, filterMonth, filterWorker])

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
      setShowPrint(true)
    },
    []
  )

  const handleOpenPrintPreview = () => {
    if (!filterMonth) {
      showToast('月を選択してください', 'error')
      return
    }
    if (!filteredRecords.length) {
      showToast('対象の記録がありません', 'error')
      return
    }
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
    if (!filterMonth) return ''
    const [y, m] = filterMonth.split('-')
    return `${y}年${parseInt(m)}月分`
  }, [filterMonth])

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

        <div className="flex flex-col gap-1 min-w-[145px]">
          <label className="text-xs font-bold text-muted">名前で絞り込み</label>
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

        <div className="flex gap-2 mt-auto">
          <Button variant="primary" size="md" onClick={handleOpenPrintPreview}>
            <Printer className="w-4 h-4" />
            月次明細書
          </Button>
          <Button variant="secondary" size="md" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </div>

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
      />

      {/* Print Preview */}
      {showPrint && settings && (
        <PaymentDoc
          records={filteredRecords}
          settings={settings}
          workers={workers}
          title={printTitle}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  )
}

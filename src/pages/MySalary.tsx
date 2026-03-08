import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PaymentDoc from '../components/print/PaymentDoc'
import {
  Wallet,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown,
} from 'lucide-react'

const statusConfig = {
  approved: { label: '承認', className: 'bg-green-100 text-green-700' },
  pending: { label: '保留', className: 'bg-mango-light text-mango-dark' },
  rejected: { label: '却下', className: 'bg-red-100 text-red-700' },
} as const

export default function MySalary() {
  const { records, settings, workers, loggedInWorker } = useStore()

  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showPrint, setShowPrint] = useState(false)

  const filteredRecords = useMemo(() => {
    if (!loggedInWorker) return []
    return records
      .filter(
        (r) =>
          r.worker_name === loggedInWorker.name && r.date.startsWith(month)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [records, loggedInWorker, month])

  const approvedRecords = useMemo(
    () => filteredRecords.filter((r) => r.status === 'approved'),
    [filteredRecords]
  )

  const approvedTotal = useMemo(
    () => approvedRecords.reduce((sum, r) => sum + r.total, 0),
    [approvedRecords]
  )

  const uniqueDates = useMemo(
    () => new Set(filteredRecords.map((r) => r.date)).size,
    [filteredRecords]
  )

  const pendingCount = useMemo(
    () => filteredRecords.filter((r) => r.status === 'pending').length,
    [filteredRecords]
  )

  const printTitle = useMemo(() => {
    if (!month) return ''
    const [y, m] = month.split('-')
    return `${y}年${parseInt(m)}月分`
  }, [month])

  if (!loggedInWorker) {
    return (
      <div className="text-center py-20 text-muted">
        ログインしてください
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-ink">給与明細</h2>
          <p className="text-sm text-muted mt-1">
            {loggedInWorker.name}さんの月別作業記録
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
          {filteredRecords.length > 0 && settings && (
            <button
              onClick={() => setShowPrint(true)}
              className="flex items-center gap-2 px-4 py-2 bg-mango text-white rounded-lg text-sm font-bold hover:bg-mango-dark transition-colors"
            >
              <FileText className="w-4 h-4" />
              請求書
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted text-xs font-bold mb-1">
            <Wallet className="w-4 h-4 text-mango" />
            合計金額
          </div>
          <div className="text-2xl font-black text-mango">
            &yen;{approvedTotal.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted text-xs font-bold mb-1">
            <CalendarDays className="w-4 h-4 text-mango" />
            作業日数
          </div>
          <div className="text-2xl font-black text-ink">
            {uniqueDates}
            <span className="text-sm font-normal text-muted ml-1">日</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted text-xs font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            承認済み
          </div>
          <div className="text-2xl font-black text-ink">
            {approvedRecords.length}
            <span className="text-sm font-normal text-muted ml-1">
              / {filteredRecords.length}件
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted text-xs font-bold mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            保留中
          </div>
          <div className="text-2xl font-black text-gray-400">
            {pendingCount}
            <span className="text-sm font-normal text-muted ml-1">件</span>
          </div>
        </div>
      </div>

      {/* Record List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">
          この月の記録はありません
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const isExpanded = expandedId === record.id
            const status = statusConfig[record.status]
            const itemsSummary = record.items
              .map((it) => `${it.name} x${it.qty}`)
              .join(', ')

            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                {/* Card Header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : record.id)
                  }
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-ink">
                        {record.date}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">
                      {itemsSummary}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-ink">
                      &yen;{record.total.toLocaleString()}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border pt-3">
                        {/* Item Table */}
                        <table className="w-full text-sm mb-3">
                          <thead>
                            <tr className="text-xs text-muted border-b border-border">
                              <th className="text-left py-1 font-bold">
                                加工の種類
                              </th>
                              <th className="text-right py-1 font-bold">
                                単価
                              </th>
                              <th className="text-right py-1 font-bold">
                                数量
                              </th>
                              <th className="text-right py-1 font-bold">
                                小計
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-border/50"
                              >
                                <td className="py-1.5">{item.name}</td>
                                <td className="text-right py-1.5 font-mono text-xs">
                                  &yen;{item.price.toLocaleString()}
                                </td>
                                <td className="text-right py-1.5 font-mono text-xs">
                                  {item.isHourly
                                    ? `${item.qty}h`
                                    : item.qty}
                                </td>
                                <td className="text-right py-1.5 font-mono text-xs font-bold">
                                  &yen;{item.sub.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Bonus Info */}
                        {record.bonus_on && (
                          <div className="text-xs bg-mango-light text-mango-dark rounded-lg px-3 py-2 mb-3">
                            上乗せ +{record.bonus_rate || 10}%: &yen;
                            {record.bonus_amt.toLocaleString()}
                          </div>
                        )}

                        {/* Remarks */}
                        {record.remarks && (
                          <div className="text-xs text-muted bg-gray-50 rounded-lg px-3 py-2">
                            備考: {record.remarks}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Doc Modal */}
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

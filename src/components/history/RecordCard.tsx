import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Printer, ChevronDown } from 'lucide-react'
import type { WorkRecord } from '../../lib/types'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface RecordCardProps {
  record: WorkRecord
  adminUnlocked: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onDelete: (id: number) => void
  onPrint: (id: number) => void
}

export default function RecordCard({
  record,
  adminUnlocked,
  onApprove,
  onReject,
  onDelete,
  onPrint,
}: RecordCardProps) {
  const [expanded, setExpanded] = useState(false)

  const avatar = record.avatar ? (
    <img
      src={record.avatar}
      alt={record.worker_name}
      className="w-[26px] h-[26px] rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-yellow to-mango flex items-center justify-center text-xs font-black text-white flex-shrink-0">
      {(record.worker_name || '?').charAt(0).toUpperCase()}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm mb-2">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-mango-light transition-colors flex-wrap"
        onClick={() => setExpanded(!expanded)}
      >
        {avatar}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{record.worker_name}</span>
            <Badge status={record.status} />
          </div>
          <div className="text-xs text-muted mt-0.5">
            {record.date} / {record.created_at}
          </div>
        </div>
        <div className="font-mono font-bold text-mango-dark text-sm">
          &yen;{record.total.toLocaleString()}
        </div>

        {adminUnlocked && (
          <div className="flex gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
            {record.status !== 'approved' && (
              <Button variant="success" size="sm" onClick={() => onApprove(record.id)}>
                承認
              </Button>
            )}
            {record.status !== 'rejected' && (
              <Button variant="danger" size="sm" onClick={() => onReject(record.id)}>
                却下
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDelete(record.id)}>
              <Trash2 className="w-4 h-4 text-red" />
            </Button>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-border bg-mango-light">
              <table className="w-full border-collapse text-xs mb-3">
                <thead>
                  <tr>
                    <th className="text-left text-muted font-bold text-[10px] p-1.5 border-b border-border">
                      加工の種類
                    </th>
                    <th className="text-left text-muted font-bold text-[10px] p-1.5 border-b border-border">
                      単価
                    </th>
                    <th className="text-left text-muted font-bold text-[10px] p-1.5 border-b border-border">
                      数量
                    </th>
                    <th className="text-right text-muted font-bold text-[10px] p-1.5 border-b border-border">
                      小計
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {record.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-1.5 border-b border-border">{item.name}</td>
                      <td className="p-1.5 border-b border-border">
                        &yen;{item.price.toLocaleString()}
                      </td>
                      <td className="p-1.5 border-b border-border">
                        {item.isHourly ? `${item.qty}h` : `${item.qty}個`}
                      </td>
                      <td className="p-1.5 border-b border-border text-right font-mono">
                        &yen;{item.sub.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {record.bonus_on && (
                    <tr>
                      <td className="p-1.5 border-b border-border" colSpan={3}>
                        +{record.bonus_rate || 10}% 上乗せ
                      </td>
                      <td className="p-1.5 border-b border-border text-right font-mono">
                        &yen;{record.bonus_amt.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  <tr className="font-bold bg-mango-light">
                    <td className="p-1.5" colSpan={3}>
                      合計
                    </td>
                    <td className="p-1.5 text-right font-mono">
                      &yen;{record.total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {record.remarks && (
                <div className="text-xs text-muted whitespace-pre-wrap mb-3">
                  備考：{record.remarks}
                </div>
              )}

              <Button variant="secondary" size="sm" onClick={() => onPrint(record.id)}>
                <Printer className="w-3.5 h-3.5" />
                印刷
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { Eye } from 'lucide-react'
import Button from '../ui/Button'
import type { WorkItem } from '../../lib/types'

export interface ConfirmSummary {
  workerName: string
  date: string
  address: string
  items: WorkItem[]
  baseTotal: number
  bonusAmt: number
  total: number
}

interface ConfirmSubmitModalProps {
  summary: ConfirmSummary | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmSubmitModal({ summary, onConfirm, onCancel }: ConfirmSubmitModalProps) {
  return (
    <AnimatePresence>
      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 safe-top safe-bottom"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-mango-light flex items-center justify-center">
                <Eye className="w-8 h-8 text-mango" />
              </div>
              <h3 className="text-lg font-black text-ink">内容を確認</h3>
              <p className="text-xs text-muted">以下の内容で提出します。よろしいですか？</p>
            </div>

            <div className="bg-cream rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">作業者</span>
                <span className="font-bold text-ink">{summary.workerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">作業日</span>
                <span className="font-mono text-ink">{summary.date}</span>
              </div>
              {summary.address && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">住所</span>
                  <span className="text-ink text-right max-w-[60%] truncate">{summary.address}</span>
                </div>
              )}
              <div className="border-t border-border my-1" />
              {summary.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-ink/70">
                  <span>{item.name}</span>
                  <span className="font-mono">
                    {item.isHourly ? `${item.qty}h` : `${item.qty}個`} × ¥{item.price.toLocaleString()} = ¥{item.sub.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-border my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-muted">小計</span>
                <span className="font-mono font-bold">¥{summary.baseTotal.toLocaleString()}</span>
              </div>
              {summary.bonusAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">ボーナス</span>
                  <span className="font-mono font-bold text-green">+¥{summary.bonusAmt.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black">
                <span>合計</span>
                <span className="text-mango-dark font-mono">¥{summary.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={onCancel}
              >
                戻る
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={onConfirm}
              >
                提出する
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

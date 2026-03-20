import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Button from '../ui/Button'
import type { WorkItem } from '../../lib/types'

export interface SubmittedSummary {
  recordId: number
  workerName: string
  date: string
  items: WorkItem[]
  baseTotal: number
  bonusAmt: number
  total: number
}

interface SubmittedModalProps {
  summary: SubmittedSummary | null
  onDismiss: () => void
  onUndo: () => void
}

export default function SubmittedModal({ summary, onDismiss, onUndo }: SubmittedModalProps) {
  return (
    <AnimatePresence>
      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 safe-top safe-bottom"
          onClick={onDismiss}
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
              <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green" />
              </div>
              <h3 className="text-lg font-black text-ink">提出完了</h3>
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
              <div className="border-t border-border my-1" />
              {summary.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-ink/70">
                  <span>{item.name}</span>
                  <span className="font-mono">
                    {item.qty} × ¥{item.price.toLocaleString()} = ¥{item.sub.toLocaleString()}
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

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onDismiss}
            >
              確認しました
            </Button>
            <button
              onClick={onUndo}
              className="w-full text-center text-xs text-muted hover:text-red cursor-pointer py-2 transition-colors"
            >
              この提出を取り消す
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

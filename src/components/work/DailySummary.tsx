import { ClipboardCheck } from 'lucide-react'
import type { WorkRecord, Worker } from '../../lib/types'

interface DailySummaryProps {
  todayRecords: WorkRecord[]
  workers: Worker[]
}

export default function DailySummary({ todayRecords, workers }: DailySummaryProps) {
  if (todayRecords.length === 0) return null

  const todaySubmittedNames = [...new Set(todayRecords.map((r) => r.worker_name))]
  const todayTotal = todayRecords.reduce((sum, r) => sum + r.total, 0)
  const unsubmittedWorkers = workers.filter((w) => !todaySubmittedNames.includes(w.name))

  return (
    <div className="bg-green-light/40 border border-green/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardCheck className="w-4 h-4 text-green" />
        <span className="text-sm font-bold text-ink">今日の提出状況</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="text-center">
          <div className="text-2xl font-black text-green font-mono">{todayRecords.length}</div>
          <div className="text-[10px] text-muted">件提出済み</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-mango-dark font-mono">¥{todayTotal.toLocaleString()}</div>
          <div className="text-[10px] text-muted">合計金額</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {todaySubmittedNames.map((name) => (
          <span key={name} className="text-[10px] bg-green/15 text-green px-2 py-0.5 rounded-full font-bold">
            {name}
          </span>
        ))}
        {unsubmittedWorkers.map((w) => (
          <span key={w.id} className="text-[10px] bg-cream text-muted px-2 py-0.5 rounded-full">
            {w.name}（未提出）
          </span>
        ))}
      </div>
    </div>
  )
}

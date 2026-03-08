import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import type { WorkRecord } from '../../lib/types'

interface WorkerChartProps {
  records: WorkRecord[]
  filterMonth: string
}

interface WorkerStats {
  name: string
  total: number
  count: number
}

export default function WorkerChart({ records, filterMonth }: WorkerChartProps) {
  const stats = useMemo(() => {
    const map = new Map<string, WorkerStats>()
    for (const r of records) {
      const existing = map.get(r.worker_name)
      if (existing) {
        existing.total += r.total
        existing.count += 1
      } else {
        map.set(r.worker_name, { name: r.worker_name, total: r.total, count: 1 })
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [records])

  const maxTotal = Math.max(...stats.map((s) => s.total), 1)
  const grandTotal = stats.reduce((sum, s) => sum + s.total, 0)

  if (stats.length === 0) return null

  const title = filterMonth
    ? `${filterMonth.split('-')[0]}年${parseInt(filterMonth.split('-')[1])}月`
    : '全期間'

  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-mango" />
        <h3 className="text-sm font-black text-ink">{title} 作業者別実績</h3>
      </div>

      <div className="space-y-3">
        {stats.map((s) => {
          const pct = (s.total / maxTotal) * 100
          const share = ((s.total / grandTotal) * 100).toFixed(0)

          return (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-[10px] font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-ink">{s.name}</span>
                  <span className="text-[10px] text-muted">{s.count}件</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-mango-dark">
                    ¥{s.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted ml-1">({share}%)</span>
                </div>
              </div>
              <div className="h-2 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-mango to-mango-dark rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex justify-between">
        <span className="text-xs font-bold text-muted">合計</span>
        <span className="text-sm font-mono font-black text-ink">¥{grandTotal.toLocaleString()}</span>
      </div>
    </div>
  )
}

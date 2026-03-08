import { useMemo } from 'react'
import type { WorkRecord } from '../../lib/types'

interface MonthSummaryProps {
  records: WorkRecord[]
}

export default function MonthSummary({ records }: MonthSummaryProps) {
  const stats = useMemo(() => {
    const totalPayment = records.reduce((a, r) => a + r.total, 0)
    const count = records.length
    const uniqueNames = new Set(records.map((r) => r.worker_name)).size
    const pendingCount = records.filter((r) => r.status !== 'approved').length
    return { totalPayment, count, uniqueNames, pendingCount }
  }, [records])

  const cards = [
    { label: '合計支払額', value: `\u00A5${stats.totalPayment.toLocaleString()}` },
    { label: '記録件数', value: `${stats.count}件` },
    { label: '外注さん数', value: `${stats.uniqueNames}名` },
    {
      label: '未承認件数',
      value: `${stats.pendingCount}件`,
      highlight: stats.pendingCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-border rounded-xl p-4"
        >
          <div className="text-[10px] font-bold text-muted tracking-wide">
            {card.label}
          </div>
          <div
            className={`text-lg font-black font-mono mt-1 ${
              card.highlight ? 'text-mango-dark' : 'text-ink'
            }`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}

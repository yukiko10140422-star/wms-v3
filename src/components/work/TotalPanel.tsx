import type { WorkItem } from '../../lib/types'

interface TotalPanelProps {
  items: WorkItem[]
  baseTotal: number
  bonusOn: boolean
  bonusRate: number
}

export default function TotalPanel({ items, baseTotal, bonusOn, bonusRate }: TotalPanelProps) {
  const bonusAmt = bonusOn ? Math.round(baseTotal * (bonusRate / 100)) : 0
  const total = baseTotal + bonusAmt

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-mango to-mango-dark text-white rounded-2xl p-5">
        <p className="text-center text-white/50 text-sm">加工内容を入力してください</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-mango to-mango-dark text-white rounded-2xl p-5">
      {/* Breakdown */}
      <div className="space-y-1 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-baseline text-sm text-white/85">
            <span>
              {item.name}{' '}
              <span className="text-white/50 font-mono">
                {item.isHourly ? `${item.qty}h` : `${item.qty}`} × ¥{item.price.toLocaleString()}
              </span>
            </span>
            <span className="font-mono">¥{item.sub.toLocaleString()}</span>
          </div>
        ))}

        {bonusOn && (
          <div className="flex justify-between items-baseline text-sm text-white/85 pt-1 border-t border-white/20">
            <span>＋{bonusRate}% 上乗せ</span>
            <span className="font-mono">¥{bonusAmt.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline pt-3 border-t border-white/30">
        <span className="text-sm font-medium">合計</span>
        <span className="font-mono text-3xl font-black">¥{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

import { GripVertical } from 'lucide-react'
import Counter from '../ui/Counter'
import type { Process } from '../../lib/types'

interface ProcessItemProps {
  process: Process
  quantity: number
  onQuantityChange: (qty: number) => void
  dragHandleProps?: Record<string, unknown>
}

export default function ProcessItem({
  process,
  quantity,
  onQuantityChange,
  dragHandleProps,
}: ProcessItemProps) {
  const subtotal = process.price * quantity

  return (
    <div
      className={`
        rounded-xl p-3 transition-all
        ${quantity > 0 ? 'bg-mango-light/60 border border-mango/20' : 'bg-white'}
      `}
    >
      {/* Mobile: 2-row layout / Desktop: 1-row layout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-ink touch-none flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Process Name + Price */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-ink block truncate">{process.name}</span>
          <span className="text-xs text-muted font-mono">
            ¥{process.price.toLocaleString()}
          </span>
        </div>

        {/* Counter - hidden on very small screens, shown inline on sm+ */}
        <div className="hidden sm:block flex-shrink-0">
          <Counter value={quantity} onChange={onQuantityChange} />
        </div>

        {/* Subtotal */}
        <div
          className={`
            w-20 text-right font-mono font-bold text-sm flex-shrink-0
            ${quantity > 0 ? 'text-mango-dark' : 'text-muted'}
          `}
        >
          ¥{subtotal.toLocaleString()}
        </div>
      </div>

      {/* Mobile-only: Counter row */}
      <div className="sm:hidden mt-2 ml-7">
        <Counter value={quantity} onChange={onQuantityChange} />
      </div>
    </div>
  )
}

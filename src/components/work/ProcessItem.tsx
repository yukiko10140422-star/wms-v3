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
        ${quantity > 0 ? 'bg-mango-light/50' : 'bg-white'}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-ink touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Process Name */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{process.name}</span>
          <span className="ml-2 text-xs text-muted font-mono">
            ¥{process.price.toLocaleString()}
          </span>
        </div>

        {/* Counter */}
        <Counter value={quantity} onChange={onQuantityChange} />

        {/* Subtotal */}
        <div
          className={`
            w-20 text-right font-mono font-bold text-sm
            ${quantity > 0 ? 'text-mango-dark' : 'text-muted'}
          `}
        >
          ¥{subtotal.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

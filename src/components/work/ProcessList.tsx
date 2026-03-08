import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../store/useStore'
import ProcessItem from './ProcessItem'
import type { WorkItem } from '../../lib/types'

interface SortableItemProps {
  id: string
  children: (props: { dragHandleProps: Record<string, unknown> }) => React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ dragHandleProps: listeners ?? {} })}
    </div>
  )
}

interface ProcessListProps {
  onItemsChange: (items: WorkItem[], baseTotal: number) => void
}

export default function ProcessList({ onItemsChange }: ProcessListProps) {
  const processes = useStore((s) => s.processes)
  const reorderProcesses = useStore((s) => s.reorderProcesses)

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [hourlyHours, setHourlyHours] = useState<number>(0)
  const [sortedIds, setSortedIds] = useState<string[]>([])

  // Sync sortedIds when processes change
  useEffect(() => {
    setSortedIds(processes.map((p) => p.id))
  }, [processes])

  const HOURLY_RATE = 1200

  const buildItems = useCallback(
    (qtys: Record<string, number>, hours: number): { items: WorkItem[]; baseTotal: number } => {
      const items: WorkItem[] = []
      let baseTotal = 0

      for (const proc of processes) {
        const qty = qtys[proc.id] || 0
        if (qty > 0) {
          const sub = proc.price * qty
          items.push({ name: proc.name, price: proc.price, qty, sub })
          baseTotal += sub
        }
      }

      if (hours > 0) {
        const sub = Math.round(HOURLY_RATE * hours)
        items.push({
          name: '会議・他業務',
          price: HOURLY_RATE,
          qty: hours,
          sub,
          isHourly: true,
        })
        baseTotal += sub
      }

      return { items, baseTotal }
    },
    [processes]
  )

  const handleQuantityChange = useCallback(
    (processId: string, qty: number) => {
      setQuantities((prev) => {
        const next = { ...prev, [processId]: qty }
        const { items, baseTotal } = buildItems(next, hourlyHours)
        onItemsChange(items, baseTotal)
        return next
      })
    },
    [buildItems, hourlyHours, onItemsChange]
  )

  const handleHourlyChange = useCallback(
    (hours: number) => {
      setHourlyHours(hours)
      const { items, baseTotal } = buildItems(quantities, hours)
      onItemsChange(items, baseTotal)
    },
    [buildItems, quantities, onItemsChange]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      setSortedIds((prev) => {
        const oldIndex = prev.indexOf(String(active.id))
        const newIndex = prev.indexOf(String(over.id))
        const newOrder = arrayMove(prev, oldIndex, newIndex)
        reorderProcesses(newOrder)
        return newOrder
      })
    },
    [reorderProcesses]
  )

  // Sort processes by sortedIds
  const sortedProcesses = sortedIds
    .map((id) => processes.find((p) => p.id === id))
    .filter(Boolean) as typeof processes

  return (
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedIds}
          strategy={verticalListSortingStrategy}
        >
          {sortedProcesses.map((proc) => (
            <SortableItem key={proc.id} id={proc.id}>
              {({ dragHandleProps }) => (
                <ProcessItem
                  process={proc}
                  quantity={quantities[proc.id] || 0}
                  onQuantityChange={(qty) => handleQuantityChange(proc.id, qty)}
                  dragHandleProps={dragHandleProps}
                />
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Hourly row - fixed at bottom */}
      <div className={`
        rounded-xl p-3 transition-all border-t border-border
        ${hourlyHours > 0 ? 'bg-mango-light/50' : 'bg-white'}
      `}>
        <div className="flex items-center gap-3">
          <div className="w-5" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">会議・他業務</span>
            <span className="ml-2 text-xs text-muted font-mono">¥1,200/h</span>
          </div>
          <input
            type="number"
            step={0.5}
            min={0}
            value={hourlyHours || ''}
            onChange={(e) => handleHourlyChange(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-20 text-center rounded-lg border border-border px-2 py-1.5 text-sm font-mono focus:border-mango focus:outline-none"
          />
          <div
            className={`
              w-20 text-right font-mono font-bold text-sm
              ${hourlyHours > 0 ? 'text-mango-dark' : 'text-muted'}
            `}
          >
            ¥{Math.round(HOURLY_RATE * hourlyHours).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

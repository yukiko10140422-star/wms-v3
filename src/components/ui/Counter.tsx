import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface CounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function Counter({ value, onChange, min = 0, max = 9999 }: CounterProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const increment = useCallback(() => {
    onChange(Math.min(value + 1, max))
  }, [value, max, onChange])

  const decrement = useCallback(() => {
    onChange(Math.max(value - 1, min))
  }, [value, min, onChange])

  const startRepeat = useCallback((action: () => void) => {
    action()
    intervalRef.current = setInterval(action, 200)
  }, [])

  const stopRepeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleStartEdit = () => {
    setEditValue(value === 0 ? '' : String(value))
    setEditing(true)
  }

  const handleFinishEdit = () => {
    setEditing(false)
    const parsed = parseInt(editValue, 10)
    if (isNaN(parsed) || parsed < min) {
      onChange(min)
    } else if (parsed > max) {
      onChange(max)
    } else {
      onChange(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit()
    }
  }

  const isAtMin = value <= min

  return (
    <div className="flex items-center gap-2">
      {/* Minus Button */}
      <button
        onPointerDown={() => !isAtMin && startRepeat(decrement)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        disabled={isAtMin}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          bg-mango-light text-mango-dark border border-mango-dark/20
          transition-all duration-150 cursor-pointer select-none
          ${isAtMin ? 'opacity-30 cursor-not-allowed' : 'hover:bg-mango-dark hover:text-white active:scale-90'}
        `}
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Value Display / Input */}
      <div className="min-w-[3.5rem] text-center">
        {editing ? (
          <input
            type="number"
            inputMode="numeric"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-14 text-center rounded-lg border-2 border-mango px-1 py-0.5 font-mono text-lg font-bold text-ink focus:outline-none"
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.button
              key={value}
              type="button"
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              onClick={handleStartEdit}
              className="inline-block font-mono text-lg font-bold text-ink cursor-text w-14 py-0.5 rounded-lg hover:bg-mango-light/60 transition-colors"
            >
              {value}
            </motion.button>
          </AnimatePresence>
        )}
      </div>

      {/* Plus Button */}
      <button
        onPointerDown={() => startRepeat(increment)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        disabled={value >= max}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          bg-mango text-white
          transition-all duration-150 cursor-pointer select-none
          hover:bg-mango-dark active:scale-90
          disabled:opacity-30 disabled:cursor-not-allowed
        `}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

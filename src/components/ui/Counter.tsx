import { useRef, useCallback } from 'react'
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

  const isAtMin = value <= min

  return (
    <div className="flex items-center gap-3">
      {/* Minus Button */}
      <button
        onPointerDown={() => !isAtMin && startRepeat(decrement)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        disabled={isAtMin}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          bg-mango-light text-mango-dark
          transition-all duration-150 cursor-pointer select-none
          ${isAtMin ? 'opacity-30 cursor-not-allowed' : 'hover:bg-mango-dark hover:text-white active:scale-90'}
        `}
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Value Display */}
      <div className="min-w-[3rem] text-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ scale: 1.15, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="inline-block font-mono text-lg font-bold text-ink"
          >
            {value}
          </motion.span>
        </AnimatePresence>
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

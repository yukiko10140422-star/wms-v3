import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Play, Pause, RotateCcw, Check } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { formatTimeLocal } from '../../lib/timerUtils'
import type { TimerLogEntry } from '../../lib/types'

interface TimerProps {
  onApply: (result: { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] }) => void
}

export interface TimerHandle {
  hasData: () => boolean
  apply: () => { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] }
}

const Timer = forwardRef<TimerHandle, TimerProps>(({ onApply }, ref) => {
  const timer = useTimer()
  const [, setTick] = useState(0)

  // Re-render every 500ms for live display
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  useImperativeHandle(ref, () => ({
    hasData: () => timer.running || timer.log.length > 0,
    apply: () => timer.apply(),
  }))

  const status = timer.running ? '作業中' : timer.log.length > 0 ? '休憩中' : '待機中'
  const statusColor = timer.running
    ? 'bg-green/20 text-green-light'
    : timer.log.length > 0
      ? 'bg-yellow/20 text-yellow'
      : 'bg-white/10 text-white/60'

  const handleReset = () => {
    if (confirm('タイマーをリセットしますか？')) {
      timer.reset()
    }
  }

  const handleApply = () => {
    const result = timer.apply()
    onApply(result)
  }

  return (
    <div className="bg-gradient-to-br from-ink to-gray-800 text-white rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-white/70">作業タイマー</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-5">
        <span className="font-mono text-4xl font-bold tracking-wider">
          {timer.getDisplay()}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          type="button"
          onClick={timer.start}
          disabled={timer.running}
          className="w-12 h-12 rounded-full bg-green/20 text-green-light flex items-center justify-center transition-all hover:bg-green/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={timer.pause}
          disabled={!timer.running}
          className="w-12 h-12 rounded-full bg-yellow/20 text-yellow flex items-center justify-center transition-all hover:bg-yellow/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Pause className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={timer.log.length === 0 && !timer.running}
          className="w-12 h-12 rounded-full bg-red/20 text-red-light flex items-center justify-center transition-all hover:bg-red/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={timer.log.length === 0 && !timer.running}
          className="w-12 h-12 rounded-full bg-mango/20 text-mango flex items-center justify-center transition-all hover:bg-mango/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Log */}
      {timer.log.length > 0 && (
        <div className="max-h-24 overflow-y-auto space-y-1">
          {timer.log.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-white/60"
            >
              <span className="font-mono">{formatTimeLocal(entry.time)}</span>
              <span className="text-white/40">—</span>
              <span>{entry.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

Timer.displayName = 'Timer'
export default Timer

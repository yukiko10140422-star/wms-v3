import { useState, useRef, useCallback, useEffect } from 'react'
import type { TimerLogEntry } from '../lib/types'

export function useTimer() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [log, setLog] = useState<TimerLogEntry[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startInterval = useCallback((base: number) => {
    clearTimer()
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      setElapsed(base + (Date.now() - startTime))
    }, 500)
  }, [clearTimer])

  const start = useCallback(() => {
    const now = Date.now()
    const isResume = log.length > 0
    const entry: TimerLogEntry = {
      type: isResume ? '再開' : '開始',
      time: new Date(now).toISOString(),
    }
    setLog((prev) => [...prev, entry])
    setSessionStart(now)
    setRunning(true)
    startInterval(elapsed)
  }, [log.length, elapsed, startInterval])

  const pause = useCallback(() => {
    clearTimer()
    const now = Date.now()
    if (sessionStart !== null) {
      setElapsed(elapsed + (now - sessionStart))
    }
    const entry: TimerLogEntry = {
      type: '休憩',
      time: new Date(now).toISOString(),
    }
    setLog((prev) => [...prev, entry])
    setSessionStart(null)
    setRunning(false)
  }, [clearTimer, sessionStart, elapsed])

  const reset = useCallback(() => {
    clearTimer()
    setRunning(false)
    setElapsed(0)
    setSessionStart(null)
    setLog([])
  }, [clearTimer])

  const apply = useCallback((): { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] } => {
    clearTimer()
    const now = Date.now()
    let finalElapsed = elapsed
    if (running && sessionStart !== null) {
      finalElapsed += now - sessionStart
    }
    const endEntry: TimerLogEntry = {
      type: '終了',
      time: new Date(now).toISOString(),
    }
    const finalLog = [...log, endEntry]
    const hours = Math.round((finalElapsed / 3600000) * 100) / 100

    setRunning(false)
    setElapsed(0)
    setSessionStart(null)
    setLog([])

    return { hours, timer_work_ms: finalElapsed, timer_log: finalLog }
  }, [clearTimer, elapsed, running, sessionStart, log])

  const getDisplay = useCallback((): string => {
    let ms = elapsed
    if (running && sessionStart !== null) {
      ms += Date.now() - sessionStart
    }
    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
  }, [elapsed, running, sessionStart])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return { running, elapsed, sessionStart, log, start, pause, reset, apply, getDisplay }
}

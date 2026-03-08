import { useState, useRef, useCallback, useEffect } from 'react'
import type { TimerLogEntry } from '../lib/types'

const STORAGE_KEY = 'wms-timer-draft'

interface TimerDraft {
  elapsed: number
  log: TimerLogEntry[]
  sessionStart: number | null
  running: boolean
  savedAt: number
}

function loadDraft(): TimerDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as TimerDraft
    // 24時間以上前のデータは破棄
    if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

function saveDraft(draft: TimerDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch { /* ignore quota errors */ }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useTimer() {
  const [initialized, setInitialized] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [log, setLog] = useState<TimerLogEntry[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 起動時にlocalStorageから復元
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setLog(draft.log)
      if (draft.running && draft.sessionStart !== null) {
        // タイマーが動いていた場合、経過分を加算して再開
        const additionalElapsed = Date.now() - draft.savedAt
        const restoredElapsed = draft.elapsed + additionalElapsed
        setElapsed(restoredElapsed)
        setSessionStart(Date.now())
        setRunning(true)
      } else {
        setElapsed(draft.elapsed)
        setSessionStart(null)
        setRunning(false)
      }
    }
    setInitialized(true)
  }, [])

  // 状態が変わるたびにlocalStorageへ保存
  useEffect(() => {
    if (!initialized) return
    saveDraft({
      elapsed,
      log,
      sessionStart,
      running,
      savedAt: Date.now(),
    })
  }, [initialized, elapsed, log, sessionStart, running])

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

  // running状態が復元された時にインターバルを開始
  useEffect(() => {
    if (initialized && running && sessionStart !== null) {
      startInterval(elapsed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized])

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
    clearDraft()
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
    clearDraft()

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

  // ページ離脱時にも保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft({
        elapsed: running && sessionStart !== null ? elapsed + (Date.now() - sessionStart) : elapsed,
        log,
        sessionStart: running ? Date.now() : null,
        running,
        savedAt: Date.now(),
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleBeforeUnload()
    })
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [elapsed, log, sessionStart, running])

  return { running, elapsed, sessionStart, log, start, pause, reset, apply, getDisplay }
}

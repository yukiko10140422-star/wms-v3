import { useState, useCallback, useEffect } from 'react'
import type { TimerLogEntry } from '../lib/types'

const STORAGE_KEY = 'wms-timer-draft'

interface TimerDraft {
  elapsed: number
  log: TimerLogEntry[]
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

/**
 * 作業タイマーフック
 *
 * 時間計測の仕組み:
 * - `elapsed`: 一時停止までに蓄積された確定済みのミリ秒
 * - `sessionStart`: 現在のセッション開始時刻（running中のみ non-null）
 * - 表示時間 = elapsed + (Date.now() - sessionStart)
 * - Timer.tsx の 500ms 再レンダリングで表示を更新
 */
export function useTimer() {
  const [initialized, setInitialized] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [log, setLog] = useState<TimerLogEntry[]>([])

  // 起動時にlocalStorageから復元
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setLog(draft.log)
      if (draft.running) {
        // タイマーが動いていた場合、保存時からの経過分を加算して再開
        const additionalElapsed = Date.now() - draft.savedAt
        setElapsed(draft.elapsed + additionalElapsed)
        setSessionStart(Date.now())
        setRunning(true)
      } else {
        setElapsed(draft.elapsed)
        setRunning(false)
      }
    }
    setInitialized(true)
  }, [])

  // 状態が変わるたびにlocalStorageへ保存
  useEffect(() => {
    if (!initialized) return
    // running中は elapsed + 現セッション分を保存
    const currentElapsed = running && sessionStart !== null
      ? elapsed + (Date.now() - sessionStart)
      : elapsed
    saveDraft({
      elapsed: currentElapsed,
      log,
      running,
      savedAt: Date.now(),
    })
  }, [initialized, elapsed, log, running, sessionStart])

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
  }, [log.length])

  const pause = useCallback(() => {
    const now = Date.now()
    if (sessionStart !== null) {
      setElapsed((prev) => prev + (now - sessionStart))
    }
    const entry: TimerLogEntry = {
      type: '休憩',
      time: new Date(now).toISOString(),
    }
    setLog((prev) => [...prev, entry])
    setSessionStart(null)
    setRunning(false)
  }, [sessionStart])

  const reset = useCallback(() => {
    setRunning(false)
    setElapsed(0)
    setSessionStart(null)
    setLog([])
    clearDraft()
  }, [])

  const apply = useCallback((): { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] } => {
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
  }, [elapsed, running, sessionStart, log])

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

  // ページ離脱時に正確な値を保存
  useEffect(() => {
    const handleSave = () => {
      const currentElapsed = running && sessionStart !== null
        ? elapsed + (Date.now() - sessionStart)
        : elapsed
      saveDraft({
        elapsed: currentElapsed,
        log,
        running,
        savedAt: Date.now(),
      })
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleSave()
    }
    window.addEventListener('beforeunload', handleSave)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', handleSave)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [elapsed, log, sessionStart, running])

  return { running, elapsed, sessionStart, log, start, pause, reset, apply, getDisplay }
}

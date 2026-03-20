/**
 * ミリ秒を「X時間XX分」または「X分XX秒」にフォーマットする
 */
export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (h > 0) {
    return `${h}時間${String(m).padStart(2, '0')}分`
  }
  if (m > 0) {
    return `${m}分${String(s).padStart(2, '0')}秒`
  }
  return `${s}秒`
}

/**
 * ISO文字列をローカル時刻（HH:MM:SS）にフォーマットする
 */
export function formatTimeLocal(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/**
 * timer_log から休憩合計ミリ秒を計算する
 */
export function calcBreakMs(timerLog: { type: string; time: string }[]): number {
  let breakMs = 0
  let pauseStart: string | null = null
  for (const entry of timerLog) {
    if (entry.type === '休憩') {
      pauseStart = entry.time
    } else if ((entry.type === '再開' || entry.type === '終了') && pauseStart) {
      const t1 = new Date(pauseStart).getTime()
      const t2 = new Date(entry.time).getTime()
      if (!isNaN(t1) && !isNaN(t2)) {
        breakMs += t2 - t1
      }
      pauseStart = null
    }
  }
  return breakMs
}

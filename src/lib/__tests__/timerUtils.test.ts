import { describe, it, expect } from 'vitest'
import { formatDurationMs, formatTimeLocal, calcBreakMs } from '../timerUtils'

describe('formatDurationMs', () => {
  it('0ms を "0秒" にフォーマットする', () => {
    expect(formatDurationMs(0)).toBe('0秒')
  })

  it('秒のみのフォーマット', () => {
    expect(formatDurationMs(30000)).toBe('30秒')
  })

  it('分と秒のフォーマット', () => {
    expect(formatDurationMs(90000)).toBe('1分30秒')
  })

  it('時間と分のフォーマット', () => {
    expect(formatDurationMs(3660000)).toBe('1時間01分')
  })

  it('分が1桁の場合はゼロパディングする', () => {
    expect(formatDurationMs(3720000)).toBe('1時間02分')
  })

  it('秒が1桁の場合はゼロパディングする', () => {
    expect(formatDurationMs(62000)).toBe('1分02秒')
  })
})

describe('formatTimeLocal', () => {
  it('ISO文字列をローカル時刻にフォーマットする', () => {
    const result = formatTimeLocal('2024-01-15T09:30:00.000Z')
    // タイムゾーン依存のためパターンマッチ
    expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/)
  })

  it('不正なISO文字列はそのまま返す', () => {
    expect(formatTimeLocal('invalid')).toBe('invalid')
  })
})

describe('calcBreakMs', () => {
  it('休憩なしの場合は0を返す', () => {
    const log = [
      { type: '開始', time: '2024-01-15T09:00:00.000Z' },
      { type: '終了', time: '2024-01-15T17:00:00.000Z' },
    ]
    expect(calcBreakMs(log)).toBe(0)
  })

  it('1回の休憩のミリ秒を計算する', () => {
    const log = [
      { type: '開始', time: '2024-01-15T09:00:00.000Z' },
      { type: '休憩', time: '2024-01-15T12:00:00.000Z' },
      { type: '再開', time: '2024-01-15T13:00:00.000Z' },
      { type: '終了', time: '2024-01-15T17:00:00.000Z' },
    ]
    expect(calcBreakMs(log)).toBe(3600000) // 1時間
  })

  it('複数回の休憩を合計する', () => {
    const log = [
      { type: '開始', time: '2024-01-15T09:00:00.000Z' },
      { type: '休憩', time: '2024-01-15T10:00:00.000Z' },
      { type: '再開', time: '2024-01-15T10:15:00.000Z' },
      { type: '休憩', time: '2024-01-15T12:00:00.000Z' },
      { type: '再開', time: '2024-01-15T12:30:00.000Z' },
      { type: '終了', time: '2024-01-15T17:00:00.000Z' },
    ]
    expect(calcBreakMs(log)).toBe(2700000) // 45分
  })

  it('休憩中に終了した場合も正しく計算する', () => {
    const log = [
      { type: '開始', time: '2024-01-15T09:00:00.000Z' },
      { type: '休憩', time: '2024-01-15T12:00:00.000Z' },
      { type: '終了', time: '2024-01-15T13:00:00.000Z' },
    ]
    expect(calcBreakMs(log)).toBe(3600000)
  })

  it('空の配列は0を返す', () => {
    expect(calcBreakMs([])).toBe(0)
  })
})

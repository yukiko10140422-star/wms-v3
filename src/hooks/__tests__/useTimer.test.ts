import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../useTimer'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTimer', () => {
  it('初期状態は停止中で0秒', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.running).toBe(false)
    expect(result.current.elapsed).toBe(0)
    expect(result.current.getDisplay()).toBe('00:00:00')
  })

  it('開始すると running が true になる', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    expect(result.current.running).toBe(true)
    expect(result.current.log).toHaveLength(1)
    expect(result.current.log[0].type).toBe('開始')
  })

  it('3秒後に正確に 00:00:03 を表示する（二重加算しない）', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(3000) })

    const display = result.current.getDisplay()
    expect(display).toBe('00:00:03')
  })

  it('一時停止で elapsed に加算し、sessionStart を null にする', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => result.current.pause())

    expect(result.current.running).toBe(false)
    expect(result.current.sessionStart).toBeNull()
    expect(result.current.elapsed).toBeGreaterThanOrEqual(4900)
    expect(result.current.elapsed).toBeLessThanOrEqual(5100)
    expect(result.current.log).toHaveLength(2)
    expect(result.current.log[1].type).toBe('休憩')
  })

  it('再開後に正確に時間が累積する', () => {
    const { result } = renderHook(() => useTimer())

    // 5秒作業
    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => result.current.pause())

    // 3秒休憩
    act(() => { vi.advanceTimersByTime(3000) })

    // 再開して5秒作業
    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(5000) })

    const display = result.current.getDisplay()
    // 合計 10秒の作業時間（休憩除く）
    expect(display).toBe('00:00:10')
  })

  it('apply で正確な hours/timer_work_ms を返す', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(7200000) }) // 2時間

    let applied: ReturnType<typeof result.current.apply> | null = null
    act(() => { applied = result.current.apply() })

    expect(applied!.hours).toBe(2)
    expect(applied!.timer_work_ms).toBeGreaterThanOrEqual(7199000)
    expect(applied!.timer_work_ms).toBeLessThanOrEqual(7201000)
    expect(applied!.timer_log[applied!.timer_log.length - 1].type).toBe('終了')

    // apply 後はリセットされる
    expect(result.current.running).toBe(false)
    expect(result.current.elapsed).toBe(0)
    expect(result.current.log).toHaveLength(0)
  })

  it('reset で全てクリアされる', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(10000) })
    act(() => result.current.reset())

    expect(result.current.running).toBe(false)
    expect(result.current.elapsed).toBe(0)
    expect(result.current.sessionStart).toBeNull()
    expect(result.current.log).toHaveLength(0)
    expect(result.current.getDisplay()).toBe('00:00:00')
  })

  it('60秒で 00:01:00 を正確に表示する', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(60000) })

    expect(result.current.getDisplay()).toBe('00:01:00')
  })

  it('3661秒で 01:01:01 を正確に表示する', () => {
    const { result } = renderHook(() => useTimer())

    act(() => result.current.start())
    act(() => { vi.advanceTimersByTime(3661000) })

    expect(result.current.getDisplay()).toBe('01:01:01')
  })
})

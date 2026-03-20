import { describe, it, expect } from 'vitest'
import { calcHourlyTotal, calcPieceTotal } from '../workCalc'

describe('calcHourlyTotal', () => {
  it('時間 × 時給で合計を計算する', () => {
    expect(calcHourlyTotal(2, 1200)).toBe(2400)
  })

  it('0時間の場合は0を返す', () => {
    expect(calcHourlyTotal(0, 1200)).toBe(0)
  })

  it('小数時間を正しく計算する', () => {
    expect(calcHourlyTotal(1.5, 1200)).toBe(1800)
  })

  it('端数を四捨五入する', () => {
    expect(calcHourlyTotal(1.3, 1000)).toBe(1300)
  })

  it('負の時間は0として扱う', () => {
    expect(calcHourlyTotal(-1, 1200)).toBe(0)
  })
})

describe('calcPieceTotal', () => {
  it('作業アイテムの合計を計算する', () => {
    const items = [
      { name: '梱包A', price: 100, qty: 5 },
      { name: '梱包B', price: 200, qty: 3 },
    ]
    expect(calcPieceTotal(items)).toBe(1100)
  })

  it('空の配列は0を返す', () => {
    expect(calcPieceTotal([])).toBe(0)
  })

  it('qty が 0 のアイテムは無視する', () => {
    const items = [
      { name: '梱包A', price: 100, qty: 0 },
      { name: '梱包B', price: 200, qty: 2 },
    ]
    expect(calcPieceTotal(items)).toBe(400)
  })
})

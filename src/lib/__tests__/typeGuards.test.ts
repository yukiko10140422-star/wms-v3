import { describe, it, expect } from 'vitest'
import {
  isProcess,
  isWorkRecord,
  isShift,
  isDraft,
  isWorkerRow,
  isSettings,
  hasStringId,
  hasNumberId,
} from '../typeGuards'

// ── isProcess ─────────────────────────────────────────

describe('isProcess', () => {
  it('正常な Process データで true を返す', () => {
    expect(isProcess({ id: 'p1', name: '皮むき', price: 100, sort_order: 1 })).toBe(true)
  })

  it('id が欠けている場合は false を返す', () => {
    expect(isProcess({ name: '皮むき', price: 100, sort_order: 1 })).toBe(false)
  })

  it('price が文字列の場合は false を返す', () => {
    expect(isProcess({ id: 'p1', name: '皮むき', price: '100', sort_order: 1 })).toBe(false)
  })

  it('null の場合は false を返す', () => {
    expect(isProcess(null)).toBe(false)
  })

  it('配列の場合は false を返す', () => {
    expect(isProcess([1, 2, 3])).toBe(false)
  })
})

// ── isWorkRecord ──────────────────────────────────────

describe('isWorkRecord', () => {
  it('正常な WorkRecord データで true を返す', () => {
    expect(isWorkRecord({
      id: 1,
      date: '2026-03-20',
      worker_name: '田中',
      total: 5000,
    })).toBe(true)
  })

  it('id が文字列の場合は false を返す', () => {
    expect(isWorkRecord({
      id: 'abc',
      date: '2026-03-20',
      worker_name: '田中',
      total: 5000,
    })).toBe(false)
  })

  it('date が欠けている場合は false を返す', () => {
    expect(isWorkRecord({
      id: 1,
      worker_name: '田中',
      total: 5000,
    })).toBe(false)
  })

  it('undefined の場合は false を返す', () => {
    expect(isWorkRecord(undefined)).toBe(false)
  })
})

// ── isShift ───────────────────────────────────────────

describe('isShift', () => {
  it('正常な Shift データで true を返す', () => {
    expect(isShift({
      id: 1,
      worker_name: '佐藤',
      dates: ['2026-03-20'],
      status: 'pending',
    })).toBe(true)
  })

  it('dates が配列でない場合は false を返す', () => {
    expect(isShift({
      id: 1,
      worker_name: '佐藤',
      dates: '2026-03-20',
      status: 'pending',
    })).toBe(false)
  })

  it('status が欠けている場合は false を返す', () => {
    expect(isShift({
      id: 1,
      worker_name: '佐藤',
      dates: ['2026-03-20'],
    })).toBe(false)
  })

  it('空オブジェクトは false を返す', () => {
    expect(isShift({})).toBe(false)
  })
})

// ── isDraft ───────────────────────────────────────────

describe('isDraft', () => {
  it('正常な Draft データで true を返す', () => {
    expect(isDraft({
      id: 'd1',
      worker_name: '鈴木',
      device_id: 'dev-001',
    })).toBe(true)
  })

  it('device_id が欠けている場合は false を返す', () => {
    expect(isDraft({
      id: 'd1',
      worker_name: '鈴木',
    })).toBe(false)
  })

  it('id が数値の場合は false を返す', () => {
    expect(isDraft({
      id: 123,
      worker_name: '鈴木',
      device_id: 'dev-001',
    })).toBe(false)
  })

  it('プリミティブ値は false を返す', () => {
    expect(isDraft('not an object')).toBe(false)
    expect(isDraft(42)).toBe(false)
  })
})

// ── isWorkerRow ───────────────────────────────────────

describe('isWorkerRow', () => {
  it('正常な Worker データで true を返す', () => {
    expect(isWorkerRow({ id: 'w1', name: '山田' })).toBe(true)
  })

  it('name が欠けている場合は false を返す', () => {
    expect(isWorkerRow({ id: 'w1' })).toBe(false)
  })

  it('id が数値の場合は false を返す', () => {
    expect(isWorkerRow({ id: 1, name: '山田' })).toBe(false)
  })

  it('null は false を返す', () => {
    expect(isWorkerRow(null)).toBe(false)
  })
})

// ── isSettings ────────────────────────────────────────

describe('isSettings', () => {
  it('正常な Settings データで true を返す', () => {
    expect(isSettings({
      id: 1,
      bonus_rate: 10,
      hourly_rate: 1200,
    })).toBe(true)
  })

  it('bonus_rate が文字列の場合は false を返す', () => {
    expect(isSettings({
      id: 1,
      bonus_rate: '10',
      hourly_rate: 1200,
    })).toBe(false)
  })

  it('hourly_rate が欠けている場合は false を返す', () => {
    expect(isSettings({
      id: 1,
      bonus_rate: 10,
    })).toBe(false)
  })
})

// ── hasStringId ───────────────────────────────────────

describe('hasStringId', () => {
  it('string 型の id があれば true を返す', () => {
    expect(hasStringId({ id: 'abc' })).toBe(true)
  })

  it('id が数値の場合は false を返す', () => {
    expect(hasStringId({ id: 123 })).toBe(false)
  })

  it('id が欠けている場合は false を返す', () => {
    expect(hasStringId({ name: 'test' })).toBe(false)
  })

  it('null は false を返す', () => {
    expect(hasStringId(null)).toBe(false)
  })
})

// ── hasNumberId ───────────────────────────────────────

describe('hasNumberId', () => {
  it('number 型の id があれば true を返す', () => {
    expect(hasNumberId({ id: 42 })).toBe(true)
  })

  it('id が文字列の場合は false を返す', () => {
    expect(hasNumberId({ id: 'abc' })).toBe(false)
  })

  it('id が欠けている場合は false を返す', () => {
    expect(hasNumberId({})).toBe(false)
  })

  it('プリミティブ値は false を返す', () => {
    expect(hasNumberId(42)).toBe(false)
    expect(hasNumberId(undefined)).toBe(false)
  })
})

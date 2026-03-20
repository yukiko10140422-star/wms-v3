import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys'
import {
  loadDraft,
  saveLocalDraft,
  clearAllDrafts,
  loadWorkerDefaults,
  saveWorkerDefaults,
  getDeviceId,
} from '../storage'
import type { FormDraft, WorkerDefaults } from '../storage'

beforeEach(() => {
  localStorage.clear()
})

// ── loadDraft ─────────────────────────────────────────

describe('loadDraft', () => {
  it('保存済みのドラフトを正しく読み込める', () => {
    const draft: FormDraft = {
      workerId: 'w1',
      workDate: '2026-03-20',
      address: '沖縄県',
      remarks: '',
      bonusOn: true,
      bonusRate: 10,
    }
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, JSON.stringify(draft))
    expect(loadDraft()).toEqual(draft)
  })

  it('何も保存されていなければ null を返す', () => {
    expect(loadDraft()).toBeNull()
  })

  it('不正な JSON が保存されている場合は null を返す', () => {
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, '{broken json!!!')
    expect(loadDraft()).toBeNull()
  })
})

// ── saveLocalDraft ────────────────────────────────────

describe('saveLocalDraft', () => {
  it('ドラフトを localStorage に保存できる', () => {
    const draft: FormDraft = {
      workerId: 'w2',
      workDate: '2026-03-21',
      address: '東京都',
      remarks: 'メモ',
      bonusOn: false,
      bonusRate: 5,
    }
    saveLocalDraft(draft)
    const stored = localStorage.getItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!)).toEqual(draft)
  })
})

// ── clearAllDrafts ────────────────────────────────────

describe('clearAllDrafts', () => {
  it('関連する全てのドラフトキーを削除する', () => {
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, 'a')
    localStorage.setItem(STORAGE_KEYS.QUANTITIES_DRAFT, 'b')
    localStorage.setItem(STORAGE_KEYS.HOURLY_DRAFT, 'c')
    localStorage.setItem(STORAGE_KEYS.TIMER_DRAFT, 'd')

    clearAllDrafts()

    expect(localStorage.getItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.QUANTITIES_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.HOURLY_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.TIMER_DRAFT)).toBeNull()
  })

  it('他のキーには影響しない', () => {
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, 'keep-me')
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, 'remove-me')

    clearAllDrafts()

    expect(localStorage.getItem(STORAGE_KEYS.DEVICE_ID)).toBe('keep-me')
  })
})

// ── loadWorkerDefaults / saveWorkerDefaults ───────────

describe('loadWorkerDefaults', () => {
  it('保存済みの作業者デフォルトを読み込める', () => {
    const defaults: WorkerDefaults = { bonusOn: true, bonusRate: 15 }
    const all = { w1: defaults }
    localStorage.setItem(STORAGE_KEYS.WORKER_DEFAULTS, JSON.stringify(all))

    expect(loadWorkerDefaults('w1')).toEqual(defaults)
  })

  it('該当作業者のデータがなければ null を返す', () => {
    const all = { w1: { bonusOn: true, bonusRate: 10 } }
    localStorage.setItem(STORAGE_KEYS.WORKER_DEFAULTS, JSON.stringify(all))

    expect(loadWorkerDefaults('w999')).toBeNull()
  })

  it('何も保存されていなければ null を返す', () => {
    expect(loadWorkerDefaults('w1')).toBeNull()
  })

  it('不正な JSON が保存されている場合は null を返す', () => {
    localStorage.setItem(STORAGE_KEYS.WORKER_DEFAULTS, 'not json')
    expect(loadWorkerDefaults('w1')).toBeNull()
  })
})

describe('saveWorkerDefaults', () => {
  it('作業者デフォルトを保存できる', () => {
    const defaults: WorkerDefaults = { bonusOn: false, bonusRate: 20 }
    saveWorkerDefaults('w1', defaults)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKER_DEFAULTS)!)
    expect(stored.w1).toEqual(defaults)
  })

  it('既存データを上書きせず別の作業者を追加できる', () => {
    saveWorkerDefaults('w1', { bonusOn: true, bonusRate: 10 })
    saveWorkerDefaults('w2', { bonusOn: false, bonusRate: 20 })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKER_DEFAULTS)!)
    expect(stored.w1).toEqual({ bonusOn: true, bonusRate: 10 })
    expect(stored.w2).toEqual({ bonusOn: false, bonusRate: 20 })
  })

  it('同じ作業者のデータを更新できる', () => {
    saveWorkerDefaults('w1', { bonusOn: true, bonusRate: 10 })
    saveWorkerDefaults('w1', { bonusOn: false, bonusRate: 25 })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKER_DEFAULTS)!)
    expect(stored.w1).toEqual({ bonusOn: false, bonusRate: 25 })
  })
})

// ── getDeviceId ───────────────────────────────────────

describe('getDeviceId', () => {
  it('初回呼び出しでデバイスIDを生成して保存する', () => {
    const id = getDeviceId()
    expect(id).toBeTruthy()
    expect(id.startsWith('d')).toBe(true)
    expect(localStorage.getItem(STORAGE_KEYS.DEVICE_ID)).toBe(id)
  })

  it('2回目の呼び出しでは同じIDを返す', () => {
    const id1 = getDeviceId()
    const id2 = getDeviceId()
    expect(id1).toBe(id2)
  })

  it('既に保存されたIDがあればそれを返す', () => {
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, 'my-device-123')
    expect(getDeviceId()).toBe('my-device-123')
  })
})

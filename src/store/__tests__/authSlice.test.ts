import { describe, it, expect, vi, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../../lib/storageKeys'

// supabase モック
const mockRpc = vi.fn()
const mockFrom = vi.fn()
const mockRemoveChannel = vi.fn()
const mockChannel = vi.fn()

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    channel: (...args: unknown[]) => mockChannel(...args),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}))

import { useStore } from '../useStore'
import type { Worker } from '../../lib/types'

const testWorker: Worker = {
  id: 'w1',
  name: 'テスト太郎',
  address: '沖縄県',
  avatar: '',
  has_pin: true,
  bank_name: '',
  bank_branch: '',
  bank_type: '',
  bank_number: '',
  bank_holder: '',
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useStore.setState({
    workers: [],
    processes: [],
    records: [],
    shifts: [],
    settings: null,
    drafts: [],
    featureRequests: [],
    syncStatus: 'idle',
    adminUnlocked: false,
    loggedInWorker: null,
    workerSessionLoaded: false,
    toast: null,
    _realtimeChannel: null,
    _draftsAvailable: false,
  })
})

// ── unlockAdmin ───────────────────────────────────────

describe('unlockAdmin', () => {
  it('RPC 成功時に adminUnlocked を true に設定する', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await useStore.getState().unlockAdmin('correct-pw')

    expect(mockRpc).toHaveBeenCalledWith('verify_admin_pw', { password: 'correct-pw' })
    expect(result).toBe(true)
    expect(useStore.getState().adminUnlocked).toBe(true)
  })

  it('RPC が false を返した場合は adminUnlocked を変更しない', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })
    const result = await useStore.getState().unlockAdmin('wrong-pw')

    expect(result).toBe(false)
    expect(useStore.getState().adminUnlocked).toBe(false)
  })

  it('RPC エラー時は false を返しトーストを表示する', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('network error') })
    const result = await useStore.getState().unlockAdmin('password')

    expect(result).toBe(false)
    expect(useStore.getState().adminUnlocked).toBe(false)
    // showToast でエラーメッセージが設定される
    expect(useStore.getState().toast?.type).toBe('error')
  })
})

// ── loginWorker ───────────────────────────────────────

describe('loginWorker', () => {
  it('RPC 成功時にワーカーセッションを設定する', async () => {
    useStore.setState({ workers: [testWorker] })
    mockRpc.mockResolvedValue({ data: true, error: null })

    const result = await useStore.getState().loginWorker('w1', '1234')

    expect(mockRpc).toHaveBeenCalledWith('verify_worker_pin', {
      p_worker_id: 'w1',
      p_pin: '1234',
    })
    expect(result).toBe(true)
    expect(useStore.getState().loggedInWorker?.id).toBe('w1')

    // localStorage にセッションが保存される
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKER_SESSION)!)
    expect(session.workerId).toBe('w1')
  })

  it('RPC エラー時は false を返す', async () => {
    useStore.setState({ workers: [testWorker] })
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc error') })

    const result = await useStore.getState().loginWorker('w1', '1234')

    expect(result).toBe(false)
    expect(useStore.getState().loggedInWorker).toBeNull()
  })

  it('PIN 不正（data が false）で false を返す', async () => {
    useStore.setState({ workers: [testWorker] })
    mockRpc.mockResolvedValue({ data: false, error: null })

    const result = await useStore.getState().loginWorker('w1', '0000')

    expect(result).toBe(false)
    expect(useStore.getState().loggedInWorker).toBeNull()
  })

  it('存在しないワーカーIDでは false を返す', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })

    const result = await useStore.getState().loginWorker('nonexistent', '1234')

    expect(result).toBe(false)
    expect(useStore.getState().loggedInWorker).toBeNull()
  })
})

// ── logoutWorker ──────────────────────────────────────

describe('logoutWorker', () => {
  it('loggedInWorker と adminUnlocked をリセットする', () => {
    useStore.setState({
      loggedInWorker: testWorker,
      adminUnlocked: true,
    })

    useStore.getState().logoutWorker()

    expect(useStore.getState().loggedInWorker).toBeNull()
    expect(useStore.getState().adminUnlocked).toBe(false)
  })

  it('localStorage からセッション・ドラフトを削除する', () => {
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, '{"workerId":"w1"}')
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, 'draft')
    localStorage.setItem(STORAGE_KEYS.QUANTITIES_DRAFT, 'qty')
    localStorage.setItem(STORAGE_KEYS.HOURLY_DRAFT, 'hourly')
    localStorage.setItem(STORAGE_KEYS.TIMER_DRAFT, 'timer')
    localStorage.setItem(STORAGE_KEYS.LAST_SUBMIT, 'submit')

    useStore.setState({ loggedInWorker: testWorker, adminUnlocked: true })
    useStore.getState().logoutWorker()

    expect(localStorage.getItem(STORAGE_KEYS.WORKER_SESSION)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.QUANTITIES_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.HOURLY_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.TIMER_DRAFT)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.LAST_SUBMIT)).toBeNull()
  })
})

// ── restoreWorkerSession ──────────────────────────────

describe('restoreWorkerSession', () => {
  it('localStorage に保存されたセッションからワーカーを復元する', () => {
    useStore.setState({ workers: [testWorker] })
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, JSON.stringify({ workerId: 'w1' }))

    useStore.getState().restoreWorkerSession()

    expect(useStore.getState().loggedInWorker?.id).toBe('w1')
    expect(useStore.getState().workerSessionLoaded).toBe(true)
  })

  it('セッションが保存されていない場合は workerSessionLoaded のみ true にする', () => {
    useStore.getState().restoreWorkerSession()

    expect(useStore.getState().loggedInWorker).toBeNull()
    expect(useStore.getState().workerSessionLoaded).toBe(true)
  })

  it('存在しないワーカーIDの場合はセッションを削除する', () => {
    useStore.setState({ workers: [testWorker] })
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, JSON.stringify({ workerId: 'deleted-worker' }))

    useStore.getState().restoreWorkerSession()

    expect(useStore.getState().loggedInWorker).toBeNull()
    expect(useStore.getState().workerSessionLoaded).toBe(true)
    expect(localStorage.getItem(STORAGE_KEYS.WORKER_SESSION)).toBeNull()
  })

  it('不正な JSON が保存されている場合はセッションを削除する', () => {
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, 'broken json!!!')

    useStore.getState().restoreWorkerSession()

    expect(useStore.getState().loggedInWorker).toBeNull()
    expect(useStore.getState().workerSessionLoaded).toBe(true)
    expect(localStorage.getItem(STORAGE_KEYS.WORKER_SESSION)).toBeNull()
  })
})

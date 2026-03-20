import { describe, it, expect, vi, beforeEach } from 'vitest'

// supabase モックを先に設定
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

function createChainMock(resolveValue: unknown = { data: [], error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'gte', 'limit', 'order', 'single'] as const
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  // Promise-like behavior
  Object.assign(chain, {
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve),
  })
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  // ストアをリセット
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

describe('unlockAdmin', () => {
  it('RPC verify_admin_pw を呼び出す', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await useStore.getState().unlockAdmin('1234')
    expect(mockRpc).toHaveBeenCalledWith('verify_admin_pw', { password: '1234' })
    expect(result).toBe(true)
    expect(useStore.getState().adminUnlocked).toBe(true)
  })

  it('パスワード不正時は false を返す', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })
    const result = await useStore.getState().unlockAdmin('wrong')
    expect(result).toBe(false)
    expect(useStore.getState().adminUnlocked).toBe(false)
  })

  it('RPC エラー時は false を返す', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc error') })
    const result = await useStore.getState().unlockAdmin('1234')
    expect(result).toBe(false)
    expect(useStore.getState().adminUnlocked).toBe(false)
  })
})

describe('loginWorker', () => {
  it('RPC verify_worker_pin を呼び出す', async () => {
    useStore.setState({
      workers: [{ id: 'w1', name: 'Test', address: '', avatar: '', has_pin: true, bank_name: '', bank_branch: '', bank_type: '', bank_number: '', bank_holder: '' }],
    })
    mockRpc.mockResolvedValue({ data: true, error: null })

    const result = await useStore.getState().loginWorker('w1', '1234')
    expect(mockRpc).toHaveBeenCalledWith('verify_worker_pin', { p_worker_id: 'w1', p_pin: '1234' })
    expect(result).toBe(true)
    expect(useStore.getState().loggedInWorker?.id).toBe('w1')
  })

  it('PIN 不正時は false を返し loggedInWorker を設定しない', async () => {
    useStore.setState({
      workers: [{ id: 'w1', name: 'Test', address: '', avatar: '', has_pin: true, bank_name: '', bank_branch: '', bank_type: '', bank_number: '', bank_holder: '' }],
    })
    mockRpc.mockResolvedValue({ data: false, error: null })

    const result = await useStore.getState().loginWorker('w1', '0000')
    expect(result).toBe(false)
    expect(useStore.getState().loggedInWorker).toBeNull()
  })

  it('存在しない worker ID では false を返す', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await useStore.getState().loginWorker('nonexistent', '1234')
    expect(result).toBe(false)
  })
})

describe('logoutWorker', () => {
  it('loggedInWorker と adminUnlocked をリセットする', () => {
    useStore.setState({
      loggedInWorker: { id: 'w1', name: 'Test', address: '', avatar: '', has_pin: true, bank_name: '', bank_branch: '', bank_type: '', bank_number: '', bank_holder: '' },
      adminUnlocked: true,
    })
    useStore.getState().logoutWorker()
    expect(useStore.getState().loggedInWorker).toBeNull()
    expect(useStore.getState().adminUnlocked).toBe(false)
  })
})

describe('fetchAll', () => {
  it('workers の select に pin を含めない', async () => {
    const workerChain = createChainMock({ data: [{ id: 'w1', name: 'Test', address: '', avatar: '', bank_name: '', bank_branch: '', bank_type: '', bank_number: '', bank_holder: '' }], error: null })
    const processChain = createChainMock({ data: [], error: null })
    const recordChain = createChainMock({ data: [], error: null })
    const shiftChain = createChainMock({ data: [], error: null })
    const settingsChain = createChainMock({ data: { id: 1, company: '', manager: '', address: '', bonus_rate: 10, bank_name: '', bank_branch: '', bank_type: '', bank_number: '', bank_holder: '', hourly_rate: 1200 }, error: null })

    // drafts 用の mock
    const draftsChain = createChainMock({ data: [], error: { code: '42P01' } })

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case 'workers': return workerChain
        case 'processes': return processChain
        case 'records': return recordChain
        case 'shifts': return shiftChain
        case 'settings': return settingsChain
        case 'drafts': return draftsChain
        default: return createChainMock()
      }
    })

    await useStore.getState().fetchAll()

    // workers の select が pin を含まないカラムリストで呼ばれている
    expect(workerChain.select).toHaveBeenCalledWith(
      expect.not.stringContaining('pin')
    )

    // settings の select が admin_pw を含まないカラムリストで呼ばれている
    expect(settingsChain.select).toHaveBeenCalledWith(
      expect.not.stringContaining('admin_pw')
    )
  })

  it('records にページネーション（gte + limit）が適用される', async () => {
    const chain = createChainMock({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().fetchAll()

    // records の呼び出しで gte と limit が使われている
    expect(chain.gte).toHaveBeenCalled()
    expect(chain.limit).toHaveBeenCalled()
  })
})

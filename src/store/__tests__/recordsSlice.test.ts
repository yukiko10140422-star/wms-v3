import { describe, it, expect, vi, beforeEach } from 'vitest'

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
import type { WorkRecord } from '../../lib/types'

function createChainMock(resolveValue: unknown = { data: [], error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'gte', 'limit', 'order', 'single'] as const
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  Object.assign(chain, {
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve),
  })
  return chain
}

const sampleRecord: Omit<WorkRecord, 'id' | 'created_at'> = {
  date: '2026-03-20',
  worker_name: 'テスト太郎',
  address: '沖縄県',
  remarks: '',
  avatar: '',
  bonus_on: true,
  bonus_amt: 500,
  bonus_rate: 10,
  items: [{ name: '皮むき', price: 100, qty: 10, sub: 1000 }],
  base_total: 5000,
  total: 5500,
  hours: 0,
  timer_log: [],
  timer_work_ms: 0,
  photos: [],
  status: 'pending',
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

// ── addRecord ─────────────────────────────────────────

describe('addRecord', () => {
  it('成功時にレコードを追加しIDを返す', async () => {
    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    const id = await useStore.getState().addRecord(sampleRecord)

    expect(id).toBeTypeOf('number')
    expect(id).not.toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(chain.insert).toHaveBeenCalled()

    // ストアに追加されていることを確認
    const records = useStore.getState().records
    expect(records).toHaveLength(1)
    expect(records[0].worker_name).toBe('テスト太郎')
    expect(records[0].total).toBe(5500)
  })

  it('成功時にトーストが表示される', async () => {
    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().addRecord(sampleRecord)

    expect(useStore.getState().toast?.type).toBe('success')
  })

  it('エラー時は null を返しストアに追加しない', async () => {
    const chain = createChainMock({ data: null, error: new Error('insert failed') })
    mockFrom.mockReturnValue(chain)

    const id = await useStore.getState().addRecord(sampleRecord)

    expect(id).toBeNull()
    expect(useStore.getState().records).toHaveLength(0)
    expect(useStore.getState().toast?.type).toBe('error')
  })
})

// ── updateRecordStatus ────────────────────────────────

describe('updateRecordStatus', () => {
  it('成功時にレコードのステータスを更新する', async () => {
    const existingRecord: WorkRecord = {
      ...sampleRecord,
      id: 100,
      created_at: '2026-03-20T00:00:00Z',
    }
    useStore.setState({ records: [existingRecord] })

    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().updateRecordStatus(100, 'approved')

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(chain.update).toHaveBeenCalledWith({ status: 'approved' })
    expect(chain.eq).toHaveBeenCalledWith('id', 100)

    const updated = useStore.getState().records.find((r) => r.id === 100)
    expect(updated?.status).toBe('approved')
  })

  it('エラー時はストアを変更せずトーストを表示する', async () => {
    const existingRecord: WorkRecord = {
      ...sampleRecord,
      id: 100,
      created_at: '2026-03-20T00:00:00Z',
    }
    useStore.setState({ records: [existingRecord] })

    const chain = createChainMock({ data: null, error: new Error('update failed') })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().updateRecordStatus(100, 'approved')

    // ステータスが変わっていないことを確認
    const record = useStore.getState().records.find((r) => r.id === 100)
    expect(record?.status).toBe('pending')
    expect(useStore.getState().toast?.type).toBe('error')
  })
})

// ── deleteRecord ──────────────────────────────────────

describe('deleteRecord', () => {
  it('成功時にレコードを削除する', async () => {
    const existingRecord: WorkRecord = {
      ...sampleRecord,
      id: 200,
      created_at: '2026-03-20T00:00:00Z',
    }
    useStore.setState({ records: [existingRecord] })

    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().deleteRecord(200)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 200)
    expect(useStore.getState().records).toHaveLength(0)
    expect(useStore.getState().toast?.type).toBe('success')
  })

  it('エラー時はレコードを削除せずトーストを表示する', async () => {
    const existingRecord: WorkRecord = {
      ...sampleRecord,
      id: 200,
      created_at: '2026-03-20T00:00:00Z',
    }
    useStore.setState({ records: [existingRecord] })

    const chain = createChainMock({ data: null, error: new Error('delete failed') })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().deleteRecord(200)

    expect(useStore.getState().records).toHaveLength(1)
    expect(useStore.getState().toast?.type).toBe('error')
  })

  it('複数レコードがある場合、指定IDのみ削除する', async () => {
    const records: WorkRecord[] = [
      { ...sampleRecord, id: 100, created_at: '2026-03-20T00:00:00Z' },
      { ...sampleRecord, id: 200, created_at: '2026-03-20T01:00:00Z' },
      { ...sampleRecord, id: 300, created_at: '2026-03-20T02:00:00Z' },
    ]
    useStore.setState({ records })

    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await useStore.getState().deleteRecord(200)

    const remaining = useStore.getState().records
    expect(remaining).toHaveLength(2)
    expect(remaining.map((r) => r.id)).toEqual([100, 300])
  })
})

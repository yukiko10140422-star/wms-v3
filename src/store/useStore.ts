import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Worker, Process, WorkRecord, Shift, Settings, Draft, FeatureRequest } from '../lib/types'

type SyncStatus = 'idle' | 'loading' | 'ok' | 'error'
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  message: string
  type: ToastType
}

/** DB の workers 行から pin を除去し has_pin にマッピング */
function toWorker(row: Record<string, unknown>): Worker {
  const { pin, ...rest } = row as Record<string, unknown> & { pin?: string | null }
  return {
    ...rest,
    has_pin: pin !== null && pin !== undefined && pin !== '',
  } as Worker
}

/** DB の settings 行から admin_pw を除去 */
function toSettings(row: Record<string, unknown>): Settings {
  const { admin_pw, ...rest } = row as Record<string, unknown> & { admin_pw?: string }
  void admin_pw
  return rest as Settings
}

/** 3ヶ月前の日付文字列（YYYY-MM-DD） */
function threeMonthsAgo(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().slice(0, 10)
}

interface StoreState {
  workers: Worker[]
  processes: Process[]
  records: WorkRecord[]
  shifts: Shift[]
  settings: Settings | null
  drafts: Draft[]
  featureRequests: FeatureRequest[]
  syncStatus: SyncStatus
  isOnline: boolean
  adminUnlocked: boolean
  loggedInWorker: Worker | null
  workerSessionLoaded: boolean
  toast: Toast | null
  _realtimeChannel: RealtimeChannel | null
  _draftsAvailable: boolean

  fetchAll: () => Promise<void>
  subscribeRealtime: () => void
  unsubscribeRealtime: () => void
  unlockAdmin: (password: string) => Promise<boolean>

  // Worker auth
  loginWorker: (workerId: string, pin: string) => Promise<boolean>
  loginWorkerAsAdmin: (workerId: string) => void
  logoutWorker: () => void
  restoreWorkerSession: () => void
  updateWorkerPin: (workerId: string, newPin: string) => Promise<boolean>

  addRecord: (record: Omit<WorkRecord, 'id' | 'created_at'>) => Promise<number | null>
  updateRecordStatus: (id: number, status: WorkRecord['status']) => Promise<void>
  deleteRecord: (id: number) => Promise<void>

  addWorker: (worker: Omit<Worker, 'id' | 'has_pin'> & { pin: string }) => Promise<void>
  updateWorker: (id: string, data: Partial<Omit<Worker, 'has_pin'>> & { pin?: string }) => Promise<void>
  deleteWorker: (id: string) => Promise<void>

  addProcess: (process: Omit<Process, 'id' | 'sort_order'>) => Promise<void>
  updateProcess: (id: string, data: Partial<Process>) => Promise<void>
  deleteProcess: (id: string) => Promise<void>
  reorderProcesses: (ids: string[]) => Promise<void>

  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>
  updateShift: (id: number, data: Partial<Shift>) => Promise<void>
  updateShiftStatus: (id: number, status: Shift['status']) => Promise<void>
  deleteShift: (id: number) => Promise<void>

  updateSettings: (data: Partial<Settings>) => Promise<void>
  showToast: (message: string, type: ToastType) => void

  // Drafts
  saveDraft: (draft: Omit<Draft, 'updated_at'>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
  fetchDrafts: () => Promise<void>

  // Feature Requests
  addFeatureRequest: (req: { author_name: string; content: string }) => Promise<void>
  fetchFeatureRequests: () => Promise<void>
  updateFeatureRequest: (id: number, data: Partial<FeatureRequest>) => Promise<void>
}

/** workers テーブルから取得するカラム（pin を除外） */
const WORKER_COLUMNS = 'id,name,address,avatar,bank_name,bank_branch,bank_type,bank_number,bank_holder'

/** settings テーブルから取得するカラム（admin_pw を除外） */
const SETTINGS_COLUMNS = 'id,company,manager,address,bonus_rate,bank_name,bank_branch,bank_type,bank_number,bank_holder,hourly_rate'

export const useStore = create<StoreState>((set, get) => ({
  workers: [],
  processes: [],
  records: [],
  shifts: [],
  settings: null,
  drafts: [],
  featureRequests: [],
  syncStatus: 'idle',
  isOnline: navigator.onLine,
  adminUnlocked: false,
  loggedInWorker: null,
  workerSessionLoaded: false,
  toast: null,
  _realtimeChannel: null,
  _draftsAvailable: false,

  subscribeRealtime: () => {
    // 既存チャンネルがあれば解除
    const existing = get()._realtimeChannel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel('wms-realtime')
      // Workers — Realtime payload にはカラムフィルタが効かないため pin を手動除去
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workers' }, (payload) => {
        const newWorker = toWorker(payload.new as Record<string, unknown>)
        set((s) => {
          if (s.workers.some((w) => w.id === newWorker.id)) return s
          return { workers: [...s.workers, newWorker] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workers' }, (payload) => {
        const updated = toWorker(payload.new as Record<string, unknown>)
        set((s) => ({
          workers: s.workers.map((w) => (w.id === updated.id ? updated : w)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workers' }, (payload) => {
        const deletedId = (payload.old as { id: string }).id
        set((s) => ({ workers: s.workers.filter((w) => w.id !== deletedId) }))
      })
      // Processes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'processes' }, (payload) => {
        const newProcess = payload.new as Process
        set((s) => {
          if (s.processes.some((p) => p.id === newProcess.id)) return s
          return { processes: [...s.processes, newProcess].sort((a, b) => a.sort_order - b.sort_order) }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'processes' }, (payload) => {
        const updated = payload.new as Process
        set((s) => ({
          processes: s.processes.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.sort_order - b.sort_order),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'processes' }, (payload) => {
        const deletedId = (payload.old as { id: string }).id
        set((s) => ({ processes: s.processes.filter((p) => p.id !== deletedId) }))
      })
      // Records
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'records' }, (payload) => {
        const newRecord = payload.new as WorkRecord
        set((s) => {
          if (s.records.some((r) => r.id === newRecord.id)) return s
          return { records: [newRecord, ...s.records] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'records' }, (payload) => {
        const updated = payload.new as WorkRecord
        set((s) => ({
          records: s.records.map((r) => (r.id === updated.id ? updated : r)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'records' }, (payload) => {
        const deletedId = (payload.old as { id: number }).id
        set((s) => ({ records: s.records.filter((r) => r.id !== deletedId) }))
      })
      // Shifts
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shifts' }, (payload) => {
        const newShift = payload.new as Shift
        set((s) => {
          if (s.shifts.some((sh) => sh.id === newShift.id)) return s
          return { shifts: [newShift, ...s.shifts] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shifts' }, (payload) => {
        const updated = payload.new as Shift
        set((s) => ({
          shifts: s.shifts.map((sh) => (sh.id === updated.id ? updated : sh)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shifts' }, (payload) => {
        const deletedId = (payload.old as { id: number }).id
        set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== deletedId) }))
      })
      // Settings — admin_pw を手動除去
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        set({ settings: toSettings(payload.new as Record<string, unknown>) })
      })
      // Drafts
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drafts' }, (payload) => {
        if (!get()._draftsAvailable) return
        if (payload.eventType === 'INSERT') {
          const newDraft = payload.new as Draft
          set((s) => {
            if (s.drafts.some((d) => d.id === newDraft.id)) return s
            return { drafts: [...s.drafts, newDraft] }
          })
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Draft
          set((s) => ({
            drafts: s.drafts.map((d) => (d.id === updated.id ? updated : d)),
          }))
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as { id: string }).id
          set((s) => ({ drafts: s.drafts.filter((d) => d.id !== deletedId) }))
        }
      })
      .subscribe()

    set({ _realtimeChannel: channel })
  },

  unsubscribeRealtime: () => {
    const channel = get()._realtimeChannel
    if (channel) {
      supabase.removeChannel(channel)
      set({ _realtimeChannel: null })
    }
  },

  fetchAll: async () => {
    set({ syncStatus: 'loading' })
    try {
      const [wRes, pRes, rRes, shRes, stRes] = await Promise.all([
        supabase.from('workers').select(WORKER_COLUMNS),
        supabase.from('processes').select('*').order('sort_order'),
        supabase.from('records').select('*').order('id', { ascending: false }).gte('date', threeMonthsAgo()).limit(500),
        supabase.from('shifts').select('*').order('id', { ascending: false }).limit(200),
        supabase.from('settings').select(SETTINGS_COLUMNS).eq('id', 1).single(),
      ])

      if (wRes.error) throw wRes.error
      if (pRes.error) throw pRes.error
      if (rRes.error) throw rRes.error
      if (shRes.error) throw shRes.error
      if (stRes.error) throw stRes.error

      // workers: DB には pin が含まれない（select で除外済み）が、has_pin を付与
      const workers = (wRes.data as Record<string, unknown>[]).map((row) => ({
        ...row,
        has_pin: false, // select に pin を含めていないため、has_pin は別途判定不可。RPC で検証するため false でも問題なし
      })) as Worker[]

      set({
        workers,
        processes: pRes.data as Process[],
        records: rRes.data as WorkRecord[],
        shifts: shRes.data as Shift[],
        settings: stRes.data as Settings,
        syncStatus: 'ok',
      })

      // draftsテーブルの存在チェック（なくてもエラーにしない）
      get().fetchDrafts()
    } catch {
      set({ syncStatus: 'error' })
    }
  },

  fetchDrafts: async () => {
    const { data, error } = await supabase.from('drafts').select('*')
    if (!error && data) {
      set({ drafts: data as Draft[], _draftsAvailable: true })

      // 48時間以上更新のないドラフトをDBから自動削除
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      const stale = data.filter((d: Draft) => d.updated_at < cutoff)
      if (stale.length > 0) {
        const staleIds = stale.map((d: Draft) => d.id)
        await supabase.from('drafts').delete().in('id', staleIds)
        set((s) => ({ drafts: s.drafts.filter((d) => !staleIds.includes(d.id)) }))
      }
    }
    // テーブルがなければ静かに無視（_draftsAvailable = false のまま）
  },

  unlockAdmin: async (password: string) => {
    const { data, error } = await supabase.rpc('verify_admin_pw', { password })
    if (error) {
      get().showToast('認証に失敗しました', 'error')
      return false
    }
    if (data === true) {
      set({ adminUnlocked: true })
      return true
    }
    return false
  },

  // Worker auth — サーバーサイド RPC で PIN 検証
  loginWorker: async (workerId: string, pin: string) => {
    const { data, error } = await supabase.rpc('verify_worker_pin', {
      p_worker_id: workerId,
      p_pin: pin,
    })
    if (error) return false
    if (data !== true) return false

    const worker = get().workers.find((w) => w.id === workerId)
    if (!worker) return false
    set({ loggedInWorker: worker })
    localStorage.setItem('wms-worker-session', JSON.stringify({ workerId: worker.id }))
    return true
  },

  loginWorkerAsAdmin: (workerId: string) => {
    const { workers, adminUnlocked } = get()
    if (!adminUnlocked) return
    const worker = workers.find((w) => w.id === workerId)
    if (!worker) return
    set({ loggedInWorker: worker })
    localStorage.setItem('wms-worker-session', JSON.stringify({ workerId: worker.id }))
  },

  logoutWorker: () => {
    set({ loggedInWorker: null, adminUnlocked: false })
    localStorage.removeItem('wms-worker-session')
    // 下書きデータをクリア（他ユーザーへのデータ漏洩防止）
    localStorage.removeItem('wms-worksubmit-draft')
    localStorage.removeItem('wms-quantities-draft')
    localStorage.removeItem('wms-hourly-draft')
    localStorage.removeItem('wms-timer-draft')
    localStorage.removeItem('wms-last-submit')
  },

  restoreWorkerSession: () => {
    try {
      const saved = localStorage.getItem('wms-worker-session')
      if (saved) {
        const { workerId } = JSON.parse(saved)
        const worker = get().workers.find((w) => w.id === workerId)
        if (worker) {
          set({ loggedInWorker: worker, workerSessionLoaded: true })
          return
        }
        // 作業者が存在しない場合
        localStorage.removeItem('wms-worker-session')
      }
    } catch {
      localStorage.removeItem('wms-worker-session')
    }
    set({ workerSessionLoaded: true })
  },

  updateWorkerPin: async (workerId: string, newPin: string) => {
    const { error } = await supabase.from('workers').update({ pin: newPin }).eq('id', workerId)
    if (error) {
      get().showToast('PINの更新に失敗しました', 'error')
      return false
    }
    set((s) => ({
      workers: s.workers.map((w) => (w.id === workerId ? { ...w, has_pin: newPin !== '' } : w)),
      loggedInWorker: s.loggedInWorker?.id === workerId
        ? { ...s.loggedInWorker, has_pin: newPin !== '' }
        : s.loggedInWorker,
    }))
    get().showToast('PINを更新しました', 'success')
    return true
  },

  // Records
  addRecord: async (record) => {
    const newRecord = { ...record, id: Date.now(), created_at: new Date().toISOString() }
    const { error } = await supabase.from('records').insert(newRecord)
    if (error) {
      get().showToast('記録の追加に失敗しました', 'error')
      return null
    }
    set((s) => ({ records: [newRecord as WorkRecord, ...s.records] }))
    get().showToast('記録を追加しました', 'success')
    return newRecord.id
  },

  updateRecordStatus: async (id, status) => {
    const { error } = await supabase.from('records').update({ status }).eq('id', id)
    if (error) {
      get().showToast('ステータス更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, status } : r)),
    }))
  },

  deleteRecord: async (id) => {
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) {
      get().showToast('記録の削除に失敗しました', 'error')
      return
    }
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
    get().showToast('記録を削除しました', 'success')
  },

  // Workers
  addWorker: async (worker) => {
    // pin は DB に送るが、ストアには has_pin: true として保持
    const { pin, ...rest } = worker
    const id = 'w' + Date.now()
    const dbWorker = { ...rest, pin, id }
    const { error } = await supabase.from('workers').insert(dbWorker)
    if (error) {
      get().showToast('作業者の追加に失敗しました', 'error')
      return
    }
    const storeWorker: Worker = { ...rest, id, has_pin: pin !== '' }
    set((s) => ({ workers: [...s.workers, storeWorker] }))
    get().showToast('作業者を追加しました', 'success')
  },

  updateWorker: async (id, data) => {
    // pin が含まれる場合は DB に送るが、ストアでは has_pin に変換
    const { pin, ...restData } = data as Partial<Omit<Worker, 'has_pin'>> & { pin?: string }
    const dbData = pin !== undefined ? { ...restData, pin } : restData
    const { error } = await supabase.from('workers').update(dbData).eq('id', id)
    if (error) {
      get().showToast('作業者の更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      workers: s.workers.map((w) => {
        if (w.id !== id) return w
        const updated = { ...w, ...restData }
        if (pin !== undefined) {
          updated.has_pin = pin !== ''
        }
        return updated
      }),
    }))
    get().showToast('作業者を更新しました', 'success')
  },

  deleteWorker: async (id) => {
    // レコードが存在する作業者は削除不可
    const worker = get().workers.find((w) => w.id === id)
    if (worker) {
      const hasRecords = get().records.some((r) => r.worker_name === worker.name)
      if (hasRecords) {
        get().showToast('作業記録がある作業者は削除できません', 'error')
        return
      }
    }
    const { error } = await supabase.from('workers').delete().eq('id', id)
    if (error) {
      get().showToast('作業者の削除に失敗しました', 'error')
      return
    }
    set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }))
    get().showToast('作業者を削除しました', 'success')
  },

  // Processes
  addProcess: async (process) => {
    const { processes } = get()
    const sort_order = processes.length
    const newProcess: Process = { ...process, id: 'c' + Date.now(), sort_order }
    const { error } = await supabase.from('processes').insert(newProcess)
    if (error) {
      get().showToast('工程の追加に失敗しました', 'error')
      return
    }
    set((s) => ({ processes: [...s.processes, newProcess] }))
    get().showToast('工程を追加しました', 'success')
  },

  updateProcess: async (id, data) => {
    const { error } = await supabase.from('processes').update(data).eq('id', id)
    if (error) {
      get().showToast('工程の更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      processes: s.processes.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
    get().showToast('工程を更新しました', 'success')
  },

  deleteProcess: async (id) => {
    const { error } = await supabase.from('processes').delete().eq('id', id)
    if (error) {
      get().showToast('工程の削除に失敗しました', 'error')
      return
    }
    set((s) => ({ processes: s.processes.filter((p) => p.id !== id) }))
    get().showToast('工程を削除しました', 'success')
  },

  reorderProcesses: async (ids) => {
    const updates = ids.map((id, i) =>
      supabase.from('processes').update({ sort_order: i }).eq('id', id)
    )
    await Promise.all(updates)
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .order('sort_order')
    if (!error && data) {
      set({ processes: data as Process[] })
    }
  },

  // Shifts
  addShift: async (shift) => {
    const newShift: Shift = { ...shift, id: Date.now() }
    const { error } = await supabase.from('shifts').insert(newShift)
    if (error) {
      get().showToast('シフトの追加に失敗しました', 'error')
      return
    }
    set((s) => ({ shifts: [newShift, ...s.shifts] }))
    get().showToast('シフトを提出しました', 'success')
  },

  updateShift: async (id, data) => {
    const { error } = await supabase.from('shifts').update(data).eq('id', id)
    if (error) {
      get().showToast('シフトの更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, ...data } : sh)),
    }))
    get().showToast('シフトを更新しました', 'success')
  },

  updateShiftStatus: async (id, status) => {
    const { error } = await supabase.from('shifts').update({ status }).eq('id', id)
    if (error) {
      get().showToast('シフトステータス更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, status } : sh)),
    }))
  },

  deleteShift: async (id) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) {
      get().showToast('シフトの削除に失敗しました', 'error')
      return
    }
    set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== id) }))
    get().showToast('シフトを削除しました', 'success')
  },

  // Settings
  updateSettings: async (data) => {
    const { error } = await supabase.from('settings').update(data).eq('id', 1)
    if (error) {
      get().showToast('設定の更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      settings: s.settings ? { ...s.settings, ...data } : null,
    }))
    get().showToast('設定を更新しました', 'success')
  },

  // Drafts
  saveDraft: async (draft) => {
    if (!get()._draftsAvailable) return
    const draftWithTimestamp = { ...draft, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('drafts').upsert(draftWithTimestamp)
    if (!error) {
      set((s) => ({
        drafts: s.drafts.some((d) => d.id === draft.id)
          ? s.drafts.map((d) => (d.id === draft.id ? draftWithTimestamp : d))
          : [...s.drafts, draftWithTimestamp],
      }))
    }
  },

  deleteDraft: async (id) => {
    if (!get()._draftsAvailable) return
    const { error } = await supabase.from('drafts').delete().eq('id', id)
    if (!error) {
      set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }))
    }
  },

  // Feature Requests
  addFeatureRequest: async (req) => {
    const newReq = {
      ...req,
      id: Date.now(),
      status: 'new' as const,
      admin_note: '',
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('feature_requests').insert(newReq)
    if (error) {
      get().showToast('送信に失敗しました', 'error')
      return
    }
    set((s) => ({ featureRequests: [newReq, ...s.featureRequests] }))
    get().showToast('リクエストを送信しました', 'success')
  },

  fetchFeatureRequests: async () => {
    const { data, error } = await supabase
      .from('feature_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ featureRequests: data as FeatureRequest[] })
    }
  },

  updateFeatureRequest: async (id, data) => {
    const { error } = await supabase.from('feature_requests').update(data).eq('id', id)
    if (error) {
      get().showToast('更新に失敗しました', 'error')
      return
    }
    set((s) => ({
      featureRequests: s.featureRequests.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    }))
  },

  // Toast
  showToast: (message, type) => {
    set({ toast: { message, type } })
    // エラーは長めに表示（読み切れない問題を解消）
    const duration = type === 'error' ? 5000 : 2500
    setTimeout(() => set({ toast: null }), duration)
  },
}))

import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Worker } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface WorkersSlice {
  addWorker: (worker: Omit<Worker, 'id' | 'has_pin'> & { pin: string }) => Promise<void>
  updateWorker: (id: string, data: Partial<Omit<Worker, 'has_pin'>> & { pin?: string }) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
}

export const createWorkersSlice: StateCreator<StoreState, [], [], WorkersSlice> = (_set, get) => ({
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
    _set((s) => ({ workers: [...s.workers, storeWorker] }))
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
    _set((s) => ({
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
    _set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }))
    get().showToast('作業者を削除しました', 'success')
  },
})

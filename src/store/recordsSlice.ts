import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { WorkRecord } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface RecordsSlice {
  addRecord: (record: Omit<WorkRecord, 'id' | 'created_at'>) => Promise<number | null>
  updateRecordStatus: (id: number, status: WorkRecord['status']) => Promise<void>
  deleteRecord: (id: number) => Promise<void>
}

export const createRecordsSlice: StateCreator<StoreState, [], [], RecordsSlice> = (_set, get) => ({
  addRecord: async (record) => {
    const newRecord = { ...record, id: Date.now(), created_at: new Date().toISOString() }
    const { error } = await supabase.from('records').insert(newRecord)
    if (error) {
      get().showToast('記録の追加に失敗しました', 'error')
      return null
    }
    _set((s) => ({ records: [newRecord as WorkRecord, ...s.records] }))
    get().showToast('記録を追加しました', 'success')
    return newRecord.id
  },

  updateRecordStatus: async (id, status) => {
    const { error } = await supabase.from('records').update({ status }).eq('id', id)
    if (error) {
      get().showToast('ステータス更新に失敗しました', 'error')
      return
    }
    _set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, status } : r)),
    }))
  },

  deleteRecord: async (id) => {
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) {
      get().showToast('記録の削除に失敗しました', 'error')
      return
    }
    _set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
    get().showToast('記録を削除しました', 'success')
  },
})

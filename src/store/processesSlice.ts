import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Process } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface ProcessesSlice {
  addProcess: (process: Omit<Process, 'id' | 'sort_order'>) => Promise<void>
  updateProcess: (id: string, data: Partial<Process>) => Promise<void>
  deleteProcess: (id: string) => Promise<void>
  reorderProcesses: (ids: string[]) => Promise<void>
}

export const createProcessesSlice: StateCreator<StoreState, [], [], ProcessesSlice> = (_set, get) => ({
  addProcess: async (process) => {
    const { processes } = get()
    const sort_order = processes.length
    const newProcess: Process = { ...process, id: 'c' + Date.now(), sort_order }
    const { error } = await supabase.from('processes').insert(newProcess)
    if (error) {
      get().showToast('工程の追加に失敗しました', 'error')
      return
    }
    _set((s) => ({ processes: [...s.processes, newProcess] }))
    get().showToast('工程を追加しました', 'success')
  },

  updateProcess: async (id, data) => {
    const { error } = await supabase.from('processes').update(data).eq('id', id)
    if (error) {
      get().showToast('工程の更新に失敗しました', 'error')
      return
    }
    _set((s) => ({
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
    _set((s) => ({ processes: s.processes.filter((p) => p.id !== id) }))
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
      _set({ processes: data as Process[] })
    }
  },
})

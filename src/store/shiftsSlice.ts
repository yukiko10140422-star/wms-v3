import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Shift } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface ShiftsSlice {
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>
  updateShift: (id: number, data: Partial<Shift>) => Promise<void>
  updateShiftStatus: (id: number, status: Shift['status']) => Promise<void>
  deleteShift: (id: number) => Promise<void>
}

export const createShiftsSlice: StateCreator<StoreState, [], [], ShiftsSlice> = (_set, get) => ({
  addShift: async (shift) => {
    const newShift: Shift = { ...shift, id: Date.now() }
    const { error } = await supabase.from('shifts').insert(newShift)
    if (error) {
      get().showToast('シフトの追加に失敗しました', 'error')
      return
    }
    _set((s) => ({ shifts: [newShift, ...s.shifts] }))
    get().showToast('シフトを提出しました', 'success')
  },

  updateShift: async (id, data) => {
    const { error } = await supabase.from('shifts').update(data).eq('id', id)
    if (error) {
      get().showToast('シフトの更新に失敗しました', 'error')
      return
    }
    _set((s) => ({
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
    _set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, status } : sh)),
    }))
  },

  deleteShift: async (id) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) {
      get().showToast('シフトの削除に失敗しました', 'error')
      return
    }
    _set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== id) }))
    get().showToast('シフトを削除しました', 'success')
  },
})

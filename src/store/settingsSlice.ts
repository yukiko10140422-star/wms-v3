import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Settings } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface SettingsSlice {
  updateSettings: (data: Partial<Settings>) => Promise<void>
}

export const createSettingsSlice: StateCreator<StoreState, [], [], SettingsSlice> = (set, get) => ({
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
})

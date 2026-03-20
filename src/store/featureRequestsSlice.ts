import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { FeatureRequest } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface FeatureRequestsSlice {
  addFeatureRequest: (req: { author_name: string; content: string }) => Promise<void>
  fetchFeatureRequests: () => Promise<void>
  updateFeatureRequest: (id: number, data: Partial<FeatureRequest>) => Promise<void>
}

export const createFeatureRequestsSlice: StateCreator<StoreState, [], [], FeatureRequestsSlice> = (set, get) => ({
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
})

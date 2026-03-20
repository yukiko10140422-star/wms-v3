import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Draft } from '../lib/types'
import { supabase } from '../lib/supabase'
import { DRAFT_STALE_MS } from '../lib/constants'

export interface DraftsSlice {
  drafts: Draft[]
  _draftsAvailable: boolean

  fetchDrafts: () => Promise<void>
  saveDraft: (draft: Omit<Draft, 'updated_at'>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
}

export const createDraftsSlice: StateCreator<StoreState, [], [], DraftsSlice> = (set, get) => ({
  drafts: [],
  _draftsAvailable: false,

  fetchDrafts: async () => {
    const { data, error } = await supabase.from('drafts').select('*')
    if (!error && data) {
      set({ drafts: data as Draft[], _draftsAvailable: true })

      // 閾値以上更新のないドラフトをDBから自動削除
      const cutoff = new Date(Date.now() - DRAFT_STALE_MS).toISOString()
      const stale = data.filter((d: Draft) => d.updated_at < cutoff)
      if (stale.length > 0) {
        const staleIds = stale.map((d: Draft) => d.id)
        await supabase.from('drafts').delete().in('id', staleIds)
        set((s) => ({ drafts: s.drafts.filter((d) => !staleIds.includes(d.id)) }))
      }
    }
    // テーブルがなければ静かに無視（_draftsAvailable = false のまま）
  },

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
})

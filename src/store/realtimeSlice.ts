import type { StateCreator } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { StoreState } from './useStore'
import type { Process, WorkRecord, Shift, Draft } from '../lib/types'
import { supabase } from '../lib/supabase'
import { toWorker, toSettings } from './helpers'

export interface RealtimeSlice {
  _realtimeChannel: RealtimeChannel | null

  subscribeRealtime: () => void
  unsubscribeRealtime: () => void
}

export const createRealtimeSlice: StateCreator<StoreState, [], [], RealtimeSlice> = (set, get) => ({
  _realtimeChannel: null,

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
})

import type { StateCreator } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { StoreState } from './useStore'
import { supabase } from '../lib/supabase'
import { toWorker, toSettings } from './helpers'
import {
  isWorkerRow,
  isProcess,
  isWorkRecord,
  isShift,
  isDraft,
  isSettings,
  hasStringId,
  hasNumberId,
} from '../lib/typeGuards'

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
        if (!isWorkerRow(payload.new)) return
        const newWorker = toWorker(payload.new)
        set((s) => {
          if (s.workers.some((w) => w.id === newWorker.id)) return s
          return { workers: [...s.workers, newWorker] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workers' }, (payload) => {
        if (!isWorkerRow(payload.new)) return
        const updated = toWorker(payload.new)
        set((s) => ({
          workers: s.workers.map((w) => (w.id === updated.id ? updated : w)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workers' }, (payload) => {
        if (!hasStringId(payload.old)) return
        set((s) => ({ workers: s.workers.filter((w) => w.id !== payload.old.id) }))
      })
      // Processes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'processes' }, (payload) => {
        if (!isProcess(payload.new)) return
        const newProcess = payload.new
        set((s) => {
          if (s.processes.some((p) => p.id === newProcess.id)) return s
          return { processes: [...s.processes, newProcess].sort((a, b) => a.sort_order - b.sort_order) }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'processes' }, (payload) => {
        if (!isProcess(payload.new)) return
        const updated = payload.new
        set((s) => ({
          processes: s.processes.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.sort_order - b.sort_order),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'processes' }, (payload) => {
        if (!hasStringId(payload.old)) return
        set((s) => ({ processes: s.processes.filter((p) => p.id !== payload.old.id) }))
      })
      // Records
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'records' }, (payload) => {
        if (!isWorkRecord(payload.new)) return
        const newRecord = payload.new
        set((s) => {
          if (s.records.some((r) => r.id === newRecord.id)) return s
          return { records: [newRecord, ...s.records] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'records' }, (payload) => {
        if (!isWorkRecord(payload.new)) return
        const updated = payload.new
        set((s) => ({
          records: s.records.map((r) => (r.id === updated.id ? updated : r)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'records' }, (payload) => {
        if (!hasNumberId(payload.old)) return
        set((s) => ({ records: s.records.filter((r) => r.id !== payload.old.id) }))
      })
      // Shifts
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shifts' }, (payload) => {
        if (!isShift(payload.new)) return
        const newShift = payload.new
        set((s) => {
          if (s.shifts.some((sh) => sh.id === newShift.id)) return s
          return { shifts: [newShift, ...s.shifts] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shifts' }, (payload) => {
        if (!isShift(payload.new)) return
        const updated = payload.new
        set((s) => ({
          shifts: s.shifts.map((sh) => (sh.id === updated.id ? updated : sh)),
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shifts' }, (payload) => {
        if (!hasNumberId(payload.old)) return
        set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== payload.old.id) }))
      })
      // Settings — admin_pw を手動除去
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (!isSettings(payload.new)) return
        set({ settings: toSettings(payload.new) })
      })
      // Drafts
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drafts' }, (payload) => {
        if (!get()._draftsAvailable) return
        if (payload.eventType === 'INSERT') {
          if (!isDraft(payload.new)) return
          const newDraft = payload.new
          set((s) => {
            if (s.drafts.some((d) => d.id === newDraft.id)) return s
            return { drafts: [...s.drafts, newDraft] }
          })
        } else if (payload.eventType === 'UPDATE') {
          if (!isDraft(payload.new)) return
          const updated = payload.new
          set((s) => ({
            drafts: s.drafts.map((d) => (d.id === updated.id ? updated : d)),
          }))
        } else if (payload.eventType === 'DELETE') {
          if (!hasStringId(payload.old)) return
          set((s) => ({ drafts: s.drafts.filter((d) => d.id !== payload.old.id) }))
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

import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Worker, Process, WorkRecord, Shift, Settings } from '../lib/types'
import { supabase } from '../lib/supabase'
import { RECORDS_FETCH_LIMIT, SHIFTS_FETCH_LIMIT } from '../lib/constants'
import { threeMonthsAgo, WORKER_COLUMNS, SETTINGS_COLUMNS } from './helpers'
import { isWorkerRow, isProcess, isWorkRecord, isShift, isSettings } from '../lib/typeGuards'

export interface FetchSlice {
  fetchAll: () => Promise<void>
}

export const createFetchSlice: StateCreator<StoreState, [], [], FetchSlice> = (set, get) => ({
  fetchAll: async () => {
    set({ syncStatus: 'loading' })
    try {
      const [wRes, pRes, rRes, shRes, stRes] = await Promise.all([
        supabase.from('workers').select(WORKER_COLUMNS),
        supabase.from('processes').select('*').order('sort_order'),
        supabase.from('records').select('*').order('id', { ascending: false }).gte('date', threeMonthsAgo()).limit(RECORDS_FETCH_LIMIT),
        supabase.from('shifts').select('*').order('id', { ascending: false }).limit(SHIFTS_FETCH_LIMIT),
        supabase.from('settings').select(SETTINGS_COLUMNS).eq('id', 1).single(),
      ])

      if (wRes.error) throw wRes.error
      if (pRes.error) throw pRes.error
      if (rRes.error) throw rRes.error
      if (shRes.error) throw shRes.error
      if (stRes.error) throw stRes.error

      // Supabase の select は型推論が効かないため最低限の as で配列化し、
      // map 内で型ガードを適用して不正な行を除外
      const workers: Worker[] = (wRes.data as Record<string, unknown>[])
        .filter(isWorkerRow)
        .map((row) => ({
          ...row,
          has_pin: false,
        })) as Worker[]

      const processes: Process[] = (pRes.data as Record<string, unknown>[]).filter(isProcess)

      const records: WorkRecord[] = (rRes.data as Record<string, unknown>[]).filter(isWorkRecord)

      const shifts: Shift[] = (shRes.data as Record<string, unknown>[]).filter(isShift)

      const settingsRaw = stRes.data as Record<string, unknown>
      const settings: Settings | null = isSettings(settingsRaw) ? (settingsRaw as Settings) : null

      set({
        workers,
        processes,
        records,
        shifts,
        settings,
        syncStatus: 'ok',
      })

      get().fetchDrafts()
    } catch {
      set({ syncStatus: 'error' })
    }
  },
})

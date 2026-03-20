import { create } from 'zustand'
import type { Worker, Process, WorkRecord, Shift, Settings, FeatureRequest } from '../lib/types'
import { TOAST_DURATION_SUCCESS, TOAST_DURATION_ERROR } from '../lib/constants'
import type { AuthSlice } from './authSlice'
import { createAuthSlice } from './authSlice'
import type { RealtimeSlice } from './realtimeSlice'
import { createRealtimeSlice } from './realtimeSlice'
import type { RecordsSlice } from './recordsSlice'
import { createRecordsSlice } from './recordsSlice'
import type { WorkersSlice } from './workersSlice'
import { createWorkersSlice } from './workersSlice'
import type { ProcessesSlice } from './processesSlice'
import { createProcessesSlice } from './processesSlice'
import type { ShiftsSlice } from './shiftsSlice'
import { createShiftsSlice } from './shiftsSlice'
import type { DraftsSlice } from './draftsSlice'
import { createDraftsSlice } from './draftsSlice'
import type { SettingsSlice } from './settingsSlice'
import { createSettingsSlice } from './settingsSlice'
import type { FeatureRequestsSlice } from './featureRequestsSlice'
import { createFeatureRequestsSlice } from './featureRequestsSlice'
import type { FetchSlice } from './fetchSlice'
import { createFetchSlice } from './fetchSlice'

type SyncStatus = 'idle' | 'loading' | 'ok' | 'error'
type ToastType = 'success' | 'error' | 'info'
interface Toast { message: string; type: ToastType }

export interface StoreState
  extends AuthSlice, RealtimeSlice, RecordsSlice, WorkersSlice,
    ProcessesSlice, ShiftsSlice, DraftsSlice, SettingsSlice,
    FeatureRequestsSlice, FetchSlice {
  workers: Worker[]
  processes: Process[]
  records: WorkRecord[]
  shifts: Shift[]
  settings: Settings | null
  featureRequests: FeatureRequest[]
  syncStatus: SyncStatus
  isOnline: boolean
  toast: Toast | null
  showToast: (message: string, type: ToastType) => void
}

export const useStore = create<StoreState>((...a) => ({
  workers: [],
  processes: [],
  records: [],
  shifts: [],
  settings: null,
  featureRequests: [],
  syncStatus: 'idle',
  isOnline: navigator.onLine,
  toast: null,

  ...createAuthSlice(...a),
  ...createRealtimeSlice(...a),
  ...createRecordsSlice(...a),
  ...createWorkersSlice(...a),
  ...createProcessesSlice(...a),
  ...createShiftsSlice(...a),
  ...createDraftsSlice(...a),
  ...createSettingsSlice(...a),
  ...createFeatureRequestsSlice(...a),
  ...createFetchSlice(...a),

  showToast: (message, type) => {
    const [set] = a
    set({ toast: { message, type } })
    const duration = type === 'error' ? TOAST_DURATION_ERROR : TOAST_DURATION_SUCCESS
    setTimeout(() => set({ toast: null }), duration)
  },
}))

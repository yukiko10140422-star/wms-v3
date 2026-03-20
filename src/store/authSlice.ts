import type { StateCreator } from 'zustand'
import type { StoreState } from './useStore'
import type { Worker } from '../lib/types'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../lib/storageKeys'

export interface AuthSlice {
  adminUnlocked: boolean
  loggedInWorker: Worker | null
  workerSessionLoaded: boolean

  unlockAdmin: (password: string) => Promise<boolean>
  loginWorker: (workerId: string, pin: string) => Promise<boolean>
  loginWorkerAsAdmin: (workerId: string) => void
  logoutWorker: () => void
  restoreWorkerSession: () => void
  updateWorkerPin: (workerId: string, newPin: string) => Promise<boolean>
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
  adminUnlocked: false,
  loggedInWorker: null,
  workerSessionLoaded: false,

  unlockAdmin: async (password: string) => {
    const { data, error } = await supabase.rpc('verify_admin_pw', { password })
    if (error) {
      get().showToast('認証に失敗しました', 'error')
      return false
    }
    if (data === true) {
      set({ adminUnlocked: true })
      return true
    }
    return false
  },

  // Worker auth — サーバーサイド RPC で PIN 検証
  loginWorker: async (workerId: string, pin: string) => {
    const { data, error } = await supabase.rpc('verify_worker_pin', {
      p_worker_id: workerId,
      p_pin: pin,
    })
    if (error) return false
    if (data !== true) return false

    const worker = get().workers.find((w) => w.id === workerId)
    if (!worker) return false
    set({ loggedInWorker: worker })
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, JSON.stringify({ workerId: worker.id }))
    return true
  },

  loginWorkerAsAdmin: (workerId: string) => {
    const { workers, adminUnlocked } = get()
    if (!adminUnlocked) return
    const worker = workers.find((w) => w.id === workerId)
    if (!worker) return
    set({ loggedInWorker: worker })
    localStorage.setItem(STORAGE_KEYS.WORKER_SESSION, JSON.stringify({ workerId: worker.id }))
  },

  logoutWorker: () => {
    set({ loggedInWorker: null, adminUnlocked: false })
    localStorage.removeItem(STORAGE_KEYS.WORKER_SESSION)
    // 下書きデータをクリア（他ユーザーへのデータ漏洩防止）
    localStorage.removeItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)
    localStorage.removeItem(STORAGE_KEYS.QUANTITIES_DRAFT)
    localStorage.removeItem(STORAGE_KEYS.HOURLY_DRAFT)
    localStorage.removeItem(STORAGE_KEYS.TIMER_DRAFT)
    localStorage.removeItem(STORAGE_KEYS.LAST_SUBMIT)
  },

  restoreWorkerSession: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKER_SESSION)
      if (saved) {
        const { workerId } = JSON.parse(saved)
        const worker = get().workers.find((w) => w.id === workerId)
        if (worker) {
          set({ loggedInWorker: worker, workerSessionLoaded: true })
          return
        }
        // 作業者が存在しない場合
        localStorage.removeItem(STORAGE_KEYS.WORKER_SESSION)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.WORKER_SESSION)
    }
    set({ workerSessionLoaded: true })
  },

  updateWorkerPin: async (workerId: string, newPin: string) => {
    const { error } = await supabase.from('workers').update({ pin: newPin }).eq('id', workerId)
    if (error) {
      get().showToast('PINの更新に失敗しました', 'error')
      return false
    }
    set((s) => ({
      workers: s.workers.map((w) => (w.id === workerId ? { ...w, has_pin: newPin !== '' } : w)),
      loggedInWorker: s.loggedInWorker?.id === workerId
        ? { ...s.loggedInWorker, has_pin: newPin !== '' }
        : s.loggedInWorker,
    }))
    get().showToast('PINを更新しました', 'success')
    return true
  },
})

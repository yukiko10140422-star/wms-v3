import { STORAGE_KEYS } from './storageKeys'

// ── 型定義 ──────────────────────────────────────────

export type WorkMode = 'piece' | 'hourly'

export interface WorkerDefaults {
  bonusOn: boolean
  bonusRate: number
  workMode?: WorkMode
}

export interface FormDraft {
  workerId: string | null
  workDate: string
  address: string
  remarks: string
  bonusOn: boolean
  bonusRate: number
}

// ── ワーカーデフォルト設定 ──────────────────────────

export function loadWorkerDefaults(workerId: string): WorkerDefaults | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKER_DEFAULTS)
    if (!raw) return null
    const all = JSON.parse(raw) as Record<string, WorkerDefaults>
    return all[workerId] ?? null
  } catch {
    return null
  }
}

export function saveWorkerDefaults(workerId: string, defaults: WorkerDefaults): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKER_DEFAULTS)
    const all = raw ? (JSON.parse(raw) as Record<string, WorkerDefaults>) : {}
    all[workerId] = defaults
    localStorage.setItem(STORAGE_KEYS.WORKER_DEFAULTS, JSON.stringify(all))
  } catch { /* ignore */ }
}

// ── フォームドラフト ────────────────────────────────

export function loadDraft(): FormDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)
    return raw ? JSON.parse(raw) as FormDraft : null
  } catch {
    return null
  }
}

export function saveLocalDraft(draft: FormDraft): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKSUBMIT_DRAFT, JSON.stringify(draft))
  } catch { /* ignore */ }
}

export function clearAllDrafts(): void {
  localStorage.removeItem(STORAGE_KEYS.WORKSUBMIT_DRAFT)
  localStorage.removeItem(STORAGE_KEYS.QUANTITIES_DRAFT)
  localStorage.removeItem(STORAGE_KEYS.HOURLY_DRAFT)
  localStorage.removeItem(STORAGE_KEYS.TIMER_DRAFT)
}

// ── 端末識別子 ──────────────────────────────────────

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
  if (!id) {
    id = 'd' + Date.now() + Math.random().toString(36).slice(2, 6)
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id)
  }
  return id
}

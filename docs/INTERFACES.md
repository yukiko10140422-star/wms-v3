# インターフェース定義書

> 部署間の契約。型やpropsの仕様を変更する場合はここに記載し、影響部署に通知する。

---

## 型定義（DEPT-2 が管理、他部署が参照）

### Worker
```typescript
type Worker = {
  id: string            // "w1772204141765"
  name: string
  address: string
  avatar: string        // base64 or ""
  has_pin: boolean      // PIN設定済みか（PIN値はクライアントに送信しない）
  bank_name: string
  bank_branch: string
  bank_type: string     // "普通" | "当座"
  bank_number: string
  bank_holder: string
}
```

### Process
```typescript
type Process = {
  id: string            // "box", "roll", etc.
  name: string
  price: number
  sort_order: number
}
```

### WorkRecord
```typescript
type WorkRecord = {
  id: number            // timestamp-based
  date: string          // "YYYY-MM-DD"
  worker_name: string
  address: string
  remarks: string
  avatar: string
  bonus_on: boolean
  bonus_amt: number
  bonus_rate: number
  items: WorkItem[]
  base_total: number
  total: number
  hours: number
  timer_log: TimerLogEntry[]
  timer_work_ms: number
  photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type WorkItem = {
  name: string
  price: number
  qty: number
  sub: number
  isHourly?: boolean
}

type TimerLogEntry = {
  type: '開始' | '再開' | '休憩' | '終了'
  time: string          // ISO string
}
```

### Shift
```typescript
type Shift = {
  id: number
  worker_name: string
  dates: string[]       // ["YYYY-MM-DD", ...]
  submitted_at: string
  type: 'shift' | 'absence'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}
```

### Settings
```typescript
type Settings = {
  id: number            // always 1
  company: string
  manager: string
  address: string
  bonus_rate: number
  bank_name: string
  bank_branch: string
  bank_type: string
  bank_number: string
  bank_holder: string
  admin_pw?: string     // クライアントには送信しない（RPC検証）
  hourly_rate: number   // 時給（デフォルト1200）
}
```

### Draft
```typescript
type Draft = {
  id: string
  worker_id: string | null
  worker_name: string
  work_date: string | null
  address: string
  remarks: string
  bonus_on: boolean
  bonus_rate: number
  quantities: Record<string, number>
  hourly_hours: number
  base_total: number
  device_id: string
  updated_at: string
}
```

### FeatureRequest
```typescript
type FeatureRequest = {
  id: number
  author_name: string
  content: string
  status: 'new' | 'reviewed' | 'planned' | 'done' | 'declined'
  admin_note: string
  created_at: string
}
```

---

## ストア（DEPT-2 が管理、他部署が使用）

### useStore（Zustand）の公開インターフェース
```typescript
type Store = {
  // データ
  workers: Worker[]
  processes: Process[]
  records: WorkRecord[]
  shifts: Shift[]
  settings: Settings

  // 同期状態
  syncStatus: 'idle' | 'loading' | 'ok' | 'error'
  isOnline: boolean

  // 認証（サーバーサイドRPC検証）
  adminUnlocked: boolean
  unlockAdmin: (pin: string) => Promise<boolean>

  // 作業者認証（サーバーサイドRPC検証）
  loggedInWorker: Worker | null
  loginWorker: (workerId: string, pin: string) => Promise<boolean>
  logoutWorker: () => void
  restoreWorkerSession: () => void
  updateWorkerPin: (workerId: string, newPin: string) => Promise<boolean>

  // データ操作
  fetchAll: () => Promise<void>
  addRecord: (record: Omit<WorkRecord, 'id' | 'created_at'>) => Promise<void>
  updateRecordStatus: (id: number, status: WorkRecord['status']) => Promise<void>
  deleteRecord: (id: number) => Promise<void>

  addWorker: (worker: Omit<Worker, 'id'>) => Promise<void>
  updateWorker: (id: string, data: Partial<Worker>) => Promise<void>
  deleteWorker: (id: string) => Promise<void>

  addProcess: (process: Omit<Process, 'sort_order'>) => Promise<void>
  updateProcess: (id: string, data: Partial<Process>) => Promise<void>
  deleteProcess: (id: string) => Promise<void>
  reorderProcesses: (ids: string[]) => Promise<void>

  addShift: (shift: Omit<Shift, 'id' | 'submitted_at'>) => Promise<void>
  updateShiftStatus: (id: number, status: Shift['status']) => Promise<void>
  deleteShift: (id: number) => Promise<void>
  updateShift: (id: number, data: Partial<Shift>) => Promise<void>

  updateSettings: (data: Partial<Settings>) => Promise<void>

  // ドラフト（リアルタイム同期）
  drafts: Draft[]
  saveDraft: (draft: Omit<Draft, 'updated_at'>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
  fetchDrafts: () => Promise<void>

  // 機能リクエスト
  addFeatureRequest: (req: { author_name: string; content: string }) => Promise<void>
  fetchFeatureRequests: () => Promise<void>
  updateFeatureRequest: (id: number, data: Partial<FeatureRequest>) => Promise<void>

  // リアルタイム
  subscribeRealtime: () => void
  unsubscribeRealtime: () => void

  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}
```

---

## UIコンポーネントのprops（DEPT-3 が管理）

### Button
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

### Counter
```typescript
type CounterProps = {
  value: number
  onChange: (value: number) => void
  min?: number          // default: 0
  max?: number          // default: 9999
}
```

### Modal
```typescript
type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
```

### Toast
```typescript
// ストア経由でトーストを表示
type ToastStore = {
  show: (message: string, type?: 'success' | 'error' | 'info') => void
}
```

### Badge
```typescript
type BadgeProps = {
  status: 'pending' | 'approved' | 'rejected'
}
```

---

## 変更履歴

| 日時 | 部署 | 変更内容 |
|------|------|---------|
| 初版 | 管理者 | 全インターフェース定義 |
| Phase 8-11 | main | Worker.pin追加、Shift.type/reason追加、WorkRecord.photos追加、Draft/FeatureRequest型追加、Store認証メソッド追加、PIN認証に変更 |
| Phase 12-13 | main | Worker.pin→has_pin、Settings.admin_pw除外+hourly_rate追加、unlockAdmin/loginWorker非同期化（RPC）、一括承認・通知バッジ追加 |

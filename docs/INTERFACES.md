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
  admin_pw: string
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

  // 認証
  adminUnlocked: boolean
  unlockAdmin: (password: string) => boolean

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

  updateSettings: (data: Partial<Settings>) => Promise<void>
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

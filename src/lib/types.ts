export type Worker = {
  id: string
  name: string
  address: string
  avatar: string
  has_pin: boolean
  bank_name: string
  bank_branch: string
  bank_type: string
  bank_number: string
  bank_holder: string
}

export type Process = {
  id: string
  name: string
  price: number
  sort_order: number
}

export type WorkItem = {
  name: string
  price: number
  qty: number
  sub: number
  isHourly?: boolean
}

export type TimerLogEntry = {
  type: '開始' | '再開' | '休憩' | '終了'
  time: string
}

export type WorkRecord = {
  id: number
  date: string
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

export type Shift = {
  id: number
  worker_name: string
  dates: string[]
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  type: 'shift' | 'absence'
  reason: string
}

export type Settings = {
  id: number
  company: string
  manager: string
  address: string
  bonus_rate: number
  bank_name: string
  bank_branch: string
  bank_type: string
  bank_number: string
  bank_holder: string
  admin_pw?: string
  hourly_rate: number
}

export type FeatureRequest = {
  id: number
  author_name: string
  content: string
  status: 'new' | 'reviewed' | 'planned' | 'done' | 'declined'
  admin_note: string
  created_at: string
}

export type Draft = {
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

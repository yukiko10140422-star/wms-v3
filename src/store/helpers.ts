import type { Worker, Settings } from '../lib/types'

/** DB の workers 行から pin を除去し has_pin にマッピング */
export function toWorker(row: Record<string, unknown>): Worker {
  const { pin, ...rest } = row as Record<string, unknown> & { pin?: string | null }
  return {
    ...rest,
    has_pin: pin !== null && pin !== undefined && pin !== '',
  } as Worker
}

/** DB の settings 行から admin_pw を除去 */
export function toSettings(row: Record<string, unknown>): Settings {
  const { admin_pw, ...rest } = row as Record<string, unknown> & { admin_pw?: string }
  void admin_pw
  return rest as Settings
}

/** 3ヶ月前の日付文字列（YYYY-MM-DD） */
export function threeMonthsAgo(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().slice(0, 10)
}

/** workers テーブルから取得するカラム（pin を除外） */
export const WORKER_COLUMNS = 'id,name,address,avatar,bank_name,bank_branch,bank_type,bank_number,bank_holder'

/** settings テーブルから取得するカラム（admin_pw を除外） */
export const SETTINGS_COLUMNS = 'id,company,manager,address,bonus_rate,bank_name,bank_branch,bank_type,bank_number,bank_holder,hourly_rate'

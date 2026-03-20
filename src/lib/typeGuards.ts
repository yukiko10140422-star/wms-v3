import type { Process, WorkRecord, Shift, Draft, Settings } from './types'

/** unknown 値がオブジェクト（null でない）であるかチェック */
function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

/** Worker 行の最低限の必須フィールドを検証（id, name が string） */
export function isWorkerRow(
  data: unknown,
): data is Record<string, unknown> & { id: string; name: string } {
  if (!isRecord(data)) return false
  return typeof data.id === 'string' && typeof data.name === 'string'
}

/** Process の最低限の必須フィールドを検証 */
export function isProcess(data: unknown): data is Process {
  if (!isRecord(data)) return false
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.price === 'number' &&
    typeof data.sort_order === 'number'
  )
}

/** WorkRecord の最低限の必須フィールドを検証 */
export function isWorkRecord(data: unknown): data is WorkRecord {
  if (!isRecord(data)) return false
  return (
    typeof data.id === 'number' &&
    typeof data.date === 'string' &&
    typeof data.worker_name === 'string' &&
    typeof data.total === 'number'
  )
}

/** Shift の最低限の必須フィールドを検証 */
export function isShift(data: unknown): data is Shift {
  if (!isRecord(data)) return false
  return (
    typeof data.id === 'number' &&
    typeof data.worker_name === 'string' &&
    Array.isArray(data.dates) &&
    typeof data.status === 'string'
  )
}

/** Draft の最低限の必須フィールドを検証 */
export function isDraft(data: unknown): data is Draft {
  if (!isRecord(data)) return false
  return (
    typeof data.id === 'string' &&
    typeof data.worker_name === 'string' &&
    typeof data.device_id === 'string'
  )
}

/** Settings の最低限の必須フィールドを検証 */
export function isSettings(data: unknown): data is Settings {
  if (!isRecord(data)) return false
  return (
    typeof data.id === 'number' &&
    typeof data.bonus_rate === 'number' &&
    typeof data.hourly_rate === 'number'
  )
}

/** DELETE イベントの old ペイロードから string 型の id を取得 */
export function hasStringId(
  data: unknown,
): data is Record<string, unknown> & { id: string } {
  if (!isRecord(data)) return false
  return typeof data.id === 'string'
}

/** DELETE イベントの old ペイロードから number 型の id を取得 */
export function hasNumberId(
  data: unknown,
): data is Record<string, unknown> & { id: number } {
  if (!isRecord(data)) return false
  return typeof data.id === 'number'
}

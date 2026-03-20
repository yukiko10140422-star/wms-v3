/**
 * 時給モードの合計計算
 */
export function calcHourlyTotal(hours: number, hourlyRate: number): number {
  if (hours <= 0) return 0
  return Math.round(hours * hourlyRate)
}

/**
 * 単価モードの合計計算
 */
export function calcPieceTotal(items: { price: number; qty: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

import { useStore } from '../store/useStore'

export function useSync() {
  const syncStatus = useStore((s) => s.syncStatus)
  const isOnline = useStore((s) => s.isOnline)
  const fetchAll = useStore((s) => s.fetchAll)

  return { syncStatus, isOnline, refresh: fetchAll }
}

import { useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import type { WorkRecord } from '../lib/types'

const QUEUE_KEY = 'wms-offline-queue'

type QueuedRecord = Omit<WorkRecord, 'id' | 'created_at'>

function loadQueue(): QueuedRecord[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: QueuedRecord[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch { /* ignore */ }
}

export function getQueueLength(): number {
  return loadQueue().length
}

export function enqueueRecord(record: QueuedRecord) {
  const queue = loadQueue()
  queue.push(record)
  saveQueue(queue)
}

export function useOfflineQueue() {
  const addRecord = useStore((s) => s.addRecord)
  const showToast = useStore((s) => s.showToast)

  const processQueue = useCallback(async () => {
    const queue = loadQueue()
    if (queue.length === 0) return

    let sent = 0
    const failed: QueuedRecord[] = []

    for (const record of queue) {
      try {
        const id = await addRecord(record)
        if (id) {
          sent++
        } else {
          failed.push(record)
        }
      } catch {
        failed.push(record)
      }
    }

    saveQueue(failed)

    if (sent > 0) {
      showToast(`オフラインで保存された${sent}件を送信しました`, 'success')
    }
    if (failed.length > 0) {
      showToast(`${failed.length}件の送信に失敗しました（次回再試行します）`, 'error')
    }
  }, [addRecord, showToast])

  // オンライン復帰時にキューを処理
  useEffect(() => {
    const handleOnline = () => {
      processQueue()
    }

    window.addEventListener('online', handleOnline)

    // 起動時にもキューを確認
    if (navigator.onLine) {
      processQueue()
    }

    return () => window.removeEventListener('online', handleOnline)
  }, [processQueue])

  return { processQueue, queueLength: getQueueLength() }
}

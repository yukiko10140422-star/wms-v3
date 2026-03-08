import { Users, Clock } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Draft } from '../../lib/types'

interface LiveDraftsProps {
  currentDeviceId: string
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'たった今'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分前`
  const hr = Math.floor(min / 60)
  return `${hr}時間前`
}

function DraftCard({ draft, processes }: { draft: Draft; processes: { id: string; name: string; price: number }[] }) {
  const quantities = draft.quantities || {}
  const activeItems = Object.entries(quantities).filter(([, qty]) => qty > 0)

  return (
    <div className="bg-white rounded-xl border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-xs font-bold">
            {draft.worker_name ? draft.worker_name.charAt(0) : '?'}
          </div>
          <span className="text-sm font-bold text-ink">
            {draft.worker_name || '（未選択）'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(draft.updated_at)}</span>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <div className="space-y-0.5">
          {activeItems.map(([procId, qty]) => {
            const proc = processes.find((p) => p.id === procId)
            return (
              <div key={procId} className="flex justify-between text-xs text-ink/70">
                <span>{proc?.name || procId}</span>
                <span className="font-mono">
                  {qty} × ¥{(proc?.price || 0).toLocaleString()} = ¥{((proc?.price || 0) * qty).toLocaleString()}
                </span>
              </div>
            )
          })}
          {draft.hourly_hours > 0 && (
            <div className="flex justify-between text-xs text-ink/70">
              <span>会議・他業務</span>
              <span className="font-mono">{draft.hourly_hours}h</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold text-mango-dark pt-1 border-t border-border mt-1">
            <span>小計</span>
            <span className="font-mono">¥{Number(draft.base_total).toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted">入力中...</p>
      )}
    </div>
  )
}

export default function LiveDrafts({ currentDeviceId }: LiveDraftsProps) {
  const drafts = useStore((s) => s.drafts)
  const processes = useStore((s) => s.processes)

  // 自分以外の端末の下書きを表示、24時間以内のもののみ
  const otherDrafts = drafts.filter((d) => {
    if (d.device_id === currentDeviceId) return false
    const age = Date.now() - new Date(d.updated_at).getTime()
    if (age > 24 * 60 * 60 * 1000) return false
    return true
  })

  if (otherDrafts.length === 0) return null

  return (
    <div className="bg-green-light/50 border border-green/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-green" />
        <span className="text-sm font-bold text-ink">
          他の端末で入力中（{otherDrafts.length}件）
        </span>
      </div>
      <div className="space-y-2">
        {otherDrafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} processes={processes} />
        ))}
      </div>
    </div>
  )
}

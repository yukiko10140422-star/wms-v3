import { useState } from 'react'
import { Users, Clock, ChevronDown, ChevronUp, CircleDot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import type { Draft } from '../../lib/types'

interface LiveDraftsProps {
  currentDeviceId: string
  onImportDraft?: (draft: Draft) => void
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

function isRecent(isoString: string): boolean {
  return Date.now() - new Date(isoString).getTime() < 5 * 60 * 1000 // 5分以内
}

function DraftCard({
  draft,
  processes,
  isSelf,
  onImport,
}: {
  draft: Draft
  processes: { id: string; name: string; price: number }[]
  isSelf: boolean
  onImport?: () => void
}) {
  const quantities = draft.quantities || {}
  const activeItems = Object.entries(quantities).filter(([, qty]) => qty > 0)
  const recent = isRecent(draft.updated_at)

  return (
    <div className={`rounded-xl border p-3 ${isSelf ? 'bg-mango-light/30 border-mango/20' : 'bg-white border-border'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-xs font-bold">
              {draft.worker_name ? draft.worker_name.charAt(0) : '?'}
            </div>
            {recent && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-ink">
              {draft.worker_name || '（未選択）'}
            </span>
            {isSelf && (
              <span className="ml-1.5 text-[10px] bg-mango/15 text-mango-dark px-1.5 py-0.5 rounded-full font-bold">
                自分
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(draft.updated_at)}</span>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <div className="space-y-0.5 ml-9">
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
          <div className="flex justify-between text-xs font-bold text-mango-dark pt-1 border-t border-border/50 mt-1">
            <span>小計</span>
            <span className="font-mono">¥{Number(draft.base_total).toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted ml-9">入力待ち...</p>
      )}

      {/* Import button - only for other devices' drafts */}
      {!isSelf && onImport && activeItems.length > 0 && (
        <button
          onClick={onImport}
          className="mt-2 ml-9 text-xs bg-mango/10 text-mango-dark hover:bg-mango/20 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
        >
          このデータを取り込む
        </button>
      )}
    </div>
  )
}

export default function LiveDrafts({ currentDeviceId, onImportDraft }: LiveDraftsProps) {
  const drafts = useStore((s) => s.drafts)
  const processes = useStore((s) => s.processes)
  const [expanded, setExpanded] = useState(false)

  // 24時間以内の全下書き
  const activeDrafts = drafts.filter((d) => {
    const age = Date.now() - new Date(d.updated_at).getTime()
    return age < 24 * 60 * 60 * 1000
  })

  // アクティブ（5分以内に更新）な人数
  const recentCount = activeDrafts.filter((d) => isRecent(d.updated_at)).length
  const otherCount = activeDrafts.filter((d) => d.device_id !== currentDeviceId).length

  if (activeDrafts.length === 0) return null

  return (
    <div className="bg-green-light/40 border border-green/20 rounded-xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {recentCount > 0 ? (
            <CircleDot className="w-4 h-4 text-green animate-pulse" />
          ) : (
            <Users className="w-4 h-4 text-green" />
          )}
          <span className="text-sm font-bold text-ink">
            {otherCount > 0
              ? `${otherCount}人が同時に作業中`
              : '自分のみ作業中'
            }
          </span>
          <span className="text-xs text-muted">
            （全{activeDrafts.length}台）
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted" />
        )}
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {activeDrafts.map((draft) => {
                const isSelf = draft.device_id === currentDeviceId
                return (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    processes={processes}
                    isSelf={isSelf}
                    onImport={!isSelf && onImportDraft ? () => onImportDraft(draft) : undefined}
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

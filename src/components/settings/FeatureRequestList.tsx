import { useState, useEffect } from 'react'
import { Lightbulb, Lock, MessageSquare } from 'lucide-react'
import { useStore } from '../../store/useStore'
import Button from '../ui/Button'
import type { FeatureRequest } from '../../lib/types'

const ADMIN_EMAIL = 'yukiko10140422@gmail.com'
const EMAIL_VERIFIED_KEY = 'wms-admin-email-verified'

const statusLabels: Record<FeatureRequest['status'], { label: string; color: string }> = {
  new: { label: '新規', color: 'bg-blue-100 text-blue-700' },
  reviewed: { label: '確認済み', color: 'bg-mango-light text-mango-dark' },
  planned: { label: '対応予定', color: 'bg-green-light text-green' },
  done: { label: '完了', color: 'bg-green/20 text-green' },
  declined: { label: '見送り', color: 'bg-red-light text-red' },
}

export default function FeatureRequestList() {
  const featureRequests = useStore((s) => s.featureRequests)
  const fetchFeatureRequests = useStore((s) => s.fetchFeatureRequests)
  const updateFeatureRequest = useStore((s) => s.updateFeatureRequest)

  const [emailVerified, setEmailVerified] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_VERIFIED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    if (emailVerified) {
      fetchFeatureRequests()
    }
  }, [emailVerified, fetchFeatureRequests])

  const handleVerifyEmail = () => {
    if (emailInput.trim().toLowerCase() === ADMIN_EMAIL) {
      setEmailVerified(true)
      setEmailError(false)
      try {
        localStorage.setItem(EMAIL_VERIFIED_KEY, 'true')
      } catch { /* ignore */ }
    } else {
      setEmailError(true)
    }
  }

  const handleStatusChange = (id: number, status: FeatureRequest['status']) => {
    updateFeatureRequest(id, { status })
  }

  const handleNoteChange = (id: number, admin_note: string) => {
    updateFeatureRequest(id, { admin_note })
  }

  // メール未認証 → ロック画面
  if (!emailVerified) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-mango" />
          <h3 className="text-sm font-black text-ink">機能リクエスト一覧</h3>
        </div>

        <div className="flex flex-col items-center gap-3 py-6">
          <Lock className="w-8 h-8 text-muted" />
          <p className="text-sm text-muted text-center">
            管理者メールアドレスを入力して確認してください
          </p>
          <div className="w-full max-w-xs space-y-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
              placeholder="メールアドレス"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                emailError
                  ? 'border-red focus:border-red focus:ring-red/10'
                  : 'border-border focus:border-mango focus:ring-mango/10'
              }`}
            />
            {emailError && (
              <p className="text-xs text-red">メールアドレスが一致しません</p>
            )}
            <Button variant="primary" className="w-full" onClick={handleVerifyEmail}>
              確認
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-mango" />
          <h3 className="text-sm font-black text-ink">機能リクエスト一覧</h3>
        </div>
        <span className="text-xs text-muted">{featureRequests.length}件</span>
      </div>

      {featureRequests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted">
          <MessageSquare className="w-8 h-8" />
          <p className="text-sm">まだリクエストはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {featureRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({
  request,
  onStatusChange,
  onNoteChange,
}: {
  request: FeatureRequest
  onStatusChange: (id: number, status: FeatureRequest['status']) => void
  onNoteChange: (id: number, note: string) => void
}) {
  const [editingNote, setEditingNote] = useState(false)
  const [noteValue, setNoteValue] = useState(request.admin_note || '')
  const status = statusLabels[request.status]
  const date = new Date(request.created_at)
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted">{request.author_name}</span>
            <span className="text-xs text-muted">{dateStr}</span>
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap">{request.content}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Status control */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(statusLabels) as FeatureRequest['status'][]).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(request.id, s)}
            className={`text-[10px] px-2 py-1 rounded-lg cursor-pointer transition-colors ${
              request.status === s
                ? 'bg-mango text-white font-bold'
                : 'bg-cream text-muted hover:bg-mango-light'
            }`}
          >
            {statusLabels[s].label}
          </button>
        ))}
      </div>

      {/* Admin note */}
      {editingNote ? (
        <div className="space-y-1.5">
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-xs focus:border-mango focus:outline-none resize-y"
            placeholder="管理者メモ..."
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onNoteChange(request.id, noteValue)
                setEditingNote(false)
              }}
              className="text-xs text-mango-dark font-bold cursor-pointer"
            >
              保存
            </button>
            <button
              onClick={() => { setEditingNote(false); setNoteValue(request.admin_note || '') }}
              className="text-xs text-muted cursor-pointer"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingNote(true)}
          className="text-xs text-muted hover:text-mango-dark cursor-pointer"
        >
          {request.admin_note ? `メモ: ${request.admin_note}` : '+ メモを追加'}
        </button>
      )}
    </div>
  )
}

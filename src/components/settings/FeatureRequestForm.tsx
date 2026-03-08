import { useState } from 'react'
import { Lightbulb, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import Button from '../ui/Button'

export default function FeatureRequestForm() {
  const addFeatureRequest = useStore((s) => s.addFeatureRequest)
  const workers = useStore((s) => s.workers)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSending(true)
    await addFeatureRequest({
      author_name: authorName.trim() || '匿名',
      content: content.trim(),
    })
    setSending(false)
    setSent(true)
    setContent('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-mango" />
        <h3 className="text-sm font-black text-ink">ほしい機能・改善リクエスト</h3>
      </div>

      <p className="text-xs text-muted">
        アプリに追加してほしい機能や改善点を送信できます。管理者が確認します。
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-muted block mb-1">お名前（任意）</label>
          <select
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10"
          >
            <option value="">匿名で送信</option>
            {workers.map((w) => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-muted block mb-1">リクエスト内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="こんな機能がほしい、ここを改善してほしい..."
            rows={4}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10 resize-y"
          />
        </div>

        <Button
          variant="primary"
          className="w-full"
          loading={sending}
          disabled={!content.trim() || sent}
          onClick={handleSubmit}
        >
          {sent ? '送信しました' : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              リクエストを送信
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import Button from '../ui/Button'

interface PasswordFormProps {
  onSave: (newPassword: string) => Promise<void>
}

export default function PasswordForm({ onSave }: PasswordFormProps) {
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setError('')

    if (!newPw) {
      setError('新しいパスワードを入力してください')
      return
    }
    if (newPw.length < 4) {
      setError('4文字以上で設定してください')
      return
    }
    if (newPw !== confirmPw) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    await onSave(newPw)
    setLoading(false)
    setNewPw('')
    setConfirmPw('')
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        管理者パスワード
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">新しいパスワード</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">確認（再入力）</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="text-red text-xs font-bold mb-3">{error}</div>
      )}

      <Button variant="primary" loading={loading} onClick={handleSave}>
        パスワードを変更
      </Button>
    </div>
  )
}

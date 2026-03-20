import { useState } from 'react'
import { LogOut, KeyRound } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'

interface MySettingsProps {
  onLogout: () => void
}

export default function MySettings({ onLogout }: MySettingsProps) {
  const { loggedInWorker, logoutWorker, updateWorkerPin, showToast } = useStore()

  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [saving, setSaving] = useState(false)

  if (!loggedInWorker) return null

  const initial = loggedInWorker.name.charAt(0)

  const handlePinChange = async () => {
    // サーバーサイドで現在のPINを検証
    const { data: pinValid } = await supabase.rpc('verify_worker_pin', {
      p_worker_id: loggedInWorker.id,
      p_pin: currentPin,
    })
    if (pinValid !== true) {
      showToast('現在のPINが正しくありません', 'error')
      return
    }
    if (!/^\d{4}$/.test(newPin)) {
      showToast('新しいPINは4桁の数字で入力してください', 'error')
      return
    }
    if (newPin !== confirmPin) {
      showToast('新しいPINが一致しません', 'error')
      return
    }

    setSaving(true)
    const success = await updateWorkerPin(loggedInWorker.id, newPin)
    setSaving(false)

    if (success) {
      showToast('PINを変更しました', 'success')
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } else {
      showToast('PIN変更に失敗しました', 'error')
    }
  }

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logoutWorker()
      onLogout()
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-border p-6 flex flex-col items-center gap-3">
        {loggedInWorker.avatar ? (
          <img
            src={loggedInWorker.avatar}
            alt={loggedInWorker.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-3xl font-bold">
            {initial}
          </div>
        )}
        <h1 className="text-xl font-bold text-ink">{loggedInWorker.name}</h1>
      </div>

      {/* PIN変更 */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-mango" />
          <h2 className="text-lg font-bold text-ink">PIN変更</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">現在のPIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-lg border border-border px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-mango focus:outline-none transition-colors"
              placeholder="••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">新しいPIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-lg border border-border px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-mango focus:outline-none transition-colors"
              placeholder="••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">新しいPIN（確認）</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-lg border border-border px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-mango focus:outline-none transition-colors"
              placeholder="••••"
            />
          </div>

          <button
            type="button"
            onClick={handlePinChange}
            disabled={saving || !currentPin || !newPin || !confirmPin}
            className="w-full rounded-lg bg-mango px-4 py-3 text-white font-bold hover:bg-mango-dark active:scale-[0.98] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? '変更中...' : 'PINを変更'}
          </button>
        </div>
      </div>

      {/* ログアウト */}
      <div className="bg-white rounded-xl border border-border p-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-500 px-4 py-3 text-white font-bold hover:bg-red-600 active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          ログアウト
        </button>
      </div>
    </div>
  )
}

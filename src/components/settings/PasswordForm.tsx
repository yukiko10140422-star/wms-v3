import { useState } from 'react'
import Button from '../ui/Button'

interface PasswordFormProps {
  onSave: (newPassword: string) => Promise<void>
}

export default function PasswordForm({ onSave }: PasswordFormProps) {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setter(digits)
    setError('')
  }

  const handleSave = async () => {
    setError('')

    if (newPin.length !== 4) {
      setError('4桁の数字で設定してください')
      return
    }
    if (newPin !== confirmPin) {
      setError('PINが一致しません')
      return
    }

    setLoading(true)
    await onSave(newPin)
    setLoading(false)
    setNewPin('')
    setConfirmPin('')
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        管理者PIN
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">新しいPIN（4桁）</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={newPin}
            onChange={(e) => handlePinChange(e.target.value, setNewPin)}
            placeholder="••••"
            className="px-3 py-2 border border-border rounded-lg text-sm text-center tracking-[0.5em] font-mono focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">確認（再入力）</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
            placeholder="••••"
            className="px-3 py-2 border border-border rounded-lg text-sm text-center tracking-[0.5em] font-mono focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="text-red text-xs font-bold mb-3">{error}</div>
      )}

      <Button variant="primary" loading={loading} onClick={handleSave}>
        PINを変更
      </Button>
    </div>
  )
}

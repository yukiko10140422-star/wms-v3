import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface AdminGuardProps {
  onUnlock: (password: string) => boolean
  open: boolean
  onClose: () => void
}

export default function AdminGuard({ onUnlock, open, onClose }: AdminGuardProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const handleSubmit = useCallback(() => {
    const result = onUnlock(password)
    if (result) {
      setPassword('')
      setError(false)
      onClose()
    } else {
      setError(true)
      setShakeKey((k) => k + 1)
    }
  }, [password, onUnlock, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleClose = () => {
    setPassword('')
    setError(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="管理者パスワードを入力">
      <motion.div
        key={shakeKey}
        animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder="パスワード"
          autoFocus
          className={`
            w-full px-4 py-3 rounded-xl border text-sm
            outline-none transition-colors
            ${error ? 'border-red bg-red-light' : 'border-border focus:border-mango'}
          `}
        />
        {error && (
          <p className="text-red text-xs mt-2">パスワードが正しくありません</p>
        )}
      </motion.div>

      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="ghost" onClick={handleClose}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          OK
        </Button>
      </div>
    </Modal>
  )
}

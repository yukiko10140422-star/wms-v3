import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Shield, X } from 'lucide-react'

interface AdminGuardProps {
  onUnlock: (password: string) => boolean
  open: boolean
  onClose: () => void
}

export default function AdminGuard({ onUnlock, open, onClose }: AdminGuardProps) {
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)

  const handleClose = useCallback(() => {
    setPin('')
    setShaking(false)
    onClose()
  }, [onClose])

  const handlePinDigit = useCallback((digit: string) => {
    setPin((prev) => {
      if (prev.length >= 4) return prev
      const next = prev + digit
      if (next.length === 4) {
        setTimeout(() => {
          const success = onUnlock(next)
          if (success) {
            setPin('')
            onClose()
          } else {
            setShaking(true)
            setTimeout(() => {
              setShaking(false)
              setPin('')
            }, 500)
          }
        }, 150)
      }
      return next
    })
  }, [onUnlock, onClose])

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    setPin('')
  }, [])

  // 物理キーボード対応
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handlePinDigit, handleBackspace, handleClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-start px-4 pt-16 pb-8 safe-top safe-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-mango-light transition-colors cursor-pointer safe-top"
            style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <X className="w-5 h-5 text-muted" />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full bg-mango-light text-mango flex items-center justify-center mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-ink">管理者PIN</h2>
            <p className="text-xs text-muted mt-1">4桁のPINを入力</p>
          </div>

          {/* PIN dots */}
          <div className={`flex gap-4 mb-8 ${shaking ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  i < pin.length ? 'bg-mango scale-110' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="h-16 rounded-xl bg-white border border-border text-xl font-bold text-ink shadow-sm hover:bg-mango-light hover:border-mango active:scale-95 transition-all duration-100 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-16 rounded-xl bg-white border border-border text-xs font-bold text-muted hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all duration-100 cursor-pointer"
            >
              クリア
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="h-16 rounded-xl bg-white border border-border text-xl font-bold text-ink shadow-sm hover:bg-mango-light hover:border-mango active:scale-95 transition-all duration-100 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-16 rounded-xl bg-white border border-border flex items-center justify-center text-muted hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all duration-100 cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

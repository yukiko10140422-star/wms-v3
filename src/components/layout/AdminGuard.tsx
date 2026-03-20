import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import PinPad from '../ui/PinPad'
import { STORAGE_KEYS } from '../../lib/storageKeys'

interface AdminGuardProps {
  onUnlock: (password: string) => Promise<boolean>
  open: boolean
  onClose: () => void
}

export default function AdminGuard({ onUnlock, open, onClose }: AdminGuardProps) {
  const handleComplete = useCallback(async (pin: string): Promise<boolean> => {
    const success = await onUnlock(pin)
    if (success) {
      onClose()
    }
    return success
  }, [onUnlock, onClose])

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
            onClick={onClose}
            aria-label="閉じる"
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-mango-light transition-colors cursor-pointer safe-top"
            style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <X className="w-5 h-5 text-muted" aria-hidden="true" />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full bg-mango-light text-mango flex items-center justify-center mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-ink">管理者PIN</h2>
            <p className="text-xs text-muted mt-1">4桁のPINを入力</p>
          </div>

          <PinPad
            onComplete={handleComplete}
            storageKey={STORAGE_KEYS.ADMIN_LOCKOUT}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

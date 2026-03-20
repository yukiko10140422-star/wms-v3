import { useState, useCallback } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import PinPad from '../components/ui/PinPad'
import { STORAGE_KEYS } from '../lib/storageKeys'

interface LoginProps {
  onLoginSuccess: () => void
  onAdminAccess: () => void
}

export default function Login({ onLoginSuccess, onAdminAccess }: LoginProps) {
  const { workers, loginWorker, showToast } = useStore()
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId)

  const handleWorkerSelect = useCallback((workerId: string, hasPin: boolean) => {
    if (!hasPin) return
    setSelectedWorkerId(workerId)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedWorkerId(null)
  }, [])

  const handlePinComplete = useCallback(async (pin: string): Promise<boolean> => {
    if (!selectedWorkerId) return false
    const success = await loginWorker(selectedWorkerId, pin)
    if (success) {
      showToast('ログインしました', 'success')
      onLoginSuccess()
    } else {
      showToast('PINが正しくありません', 'error')
    }
    return success
  }, [selectedWorkerId, loginWorker, showToast, onLoginSuccess])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 pt-12 pb-8 safe-top">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-10">
        <span className="text-3xl">🥭</span>
        <h1 className="text-2xl font-bold text-ink tracking-tight">World Mango System</h1>
      </div>

      {!selectedWorkerId ? (
        /* Step 1: Worker Selection */
        <div className="w-full max-w-md">
          <p className="text-center text-muted text-sm mb-6">作業者を選択してください</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {workers.map((worker) => {
              const hasPin = worker.has_pin
              const initial = worker.name.charAt(0)

              return (
                <button
                  key={worker.id}
                  type="button"
                  disabled={!hasPin}
                  onClick={() => handleWorkerSelect(worker.id, worker.has_pin)}
                  className={`
                    relative flex flex-col items-center gap-2 rounded-xl px-3 py-4 transition-all duration-150
                    ${
                      hasPin
                        ? 'bg-white border border-border shadow-sm hover:shadow-md hover:border-mango cursor-pointer active:scale-95'
                        : 'bg-white/50 border border-border/50 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  {!hasPin && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">
                      PIN未設定
                    </span>
                  )}
                  {worker.avatar ? (
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                    />
                  ) : null}
                  <div className={`w-14 h-14 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-xl font-bold ${worker.avatar ? 'hidden' : ''}`}>
                    {initial}
                  </div>
                  <span className="text-sm font-medium text-ink truncate w-full text-center">
                    {worker.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Step 2: PIN Input */
        <div className="w-full max-w-xs flex flex-col items-center">
          <button
            type="button"
            onClick={handleBack}
            className="self-start flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>

          <div className="flex flex-col items-center mb-8">
            {selectedWorker?.avatar ? (
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                className="w-16 h-16 rounded-full object-cover mb-2"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
              />
            ) : null}
            <div className={`w-16 h-16 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-2xl font-bold mb-2 ${selectedWorker?.avatar ? 'hidden' : ''}`}>
              {selectedWorker?.name.charAt(0)}
            </div>
            <span className="text-lg font-bold text-ink">{selectedWorker?.name}</span>
            <span className="text-xs text-muted mt-1">4桁のPINを入力</span>
          </div>

          <PinPad
            onComplete={handlePinComplete}
            storageKey={STORAGE_KEYS.LOGIN_LOCKOUT}
          />
        </div>
      )}

      {/* Admin access button */}
      <div className="mt-10">
        <button
          type="button"
          onClick={onAdminAccess}
          className="flex items-center gap-2 text-sm text-muted hover:text-mango-dark transition-colors cursor-pointer"
        >
          <Shield className="w-4 h-4" />
          管理者としてログイン
        </button>
      </div>
    </div>
  )
}

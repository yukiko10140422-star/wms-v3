import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, Delete, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 30

interface LoginProps {
  onLoginSuccess: () => void
  onAdminAccess: () => void
}

export default function Login({ onLoginSuccess, onAdminAccess }: LoginProps) {
  const { workers, loginWorker, showToast } = useStore()
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId)

  // Countdown timer for lockout
  useEffect(() => {
    if (lockedUntil === null) {
      setLockoutRemaining(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setLockoutRemaining(remaining)
      if (remaining <= 0) {
        setLockedUntil(null)
        setFailedAttempts(0)
        if (lockoutTimerRef.current) {
          clearInterval(lockoutTimerRef.current)
          lockoutTimerRef.current = null
        }
      }
    }
    tick()
    lockoutTimerRef.current = setInterval(tick, 1000)
    return () => {
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current)
        lockoutTimerRef.current = null
      }
    }
  }, [lockedUntil])

  const handleWorkerSelect = useCallback((workerId: string, workerPin: string | null) => {
    if (workerPin === null || workerPin === '') return
    setSelectedWorkerId(workerId)
    setPin('')
  }, [])

  const handleBack = useCallback(() => {
    setSelectedWorkerId(null)
    setPin('')
    setShaking(false)
    setFailedAttempts(0)
    setLockedUntil(null)
  }, [])

  const handlePinDigit = useCallback((digit: string) => {
    if (isLockedOut) return
    setPin((prev) => {
      if (prev.length >= 4) return prev
      const next = prev + digit
      if (next.length === 4 && selectedWorkerId) {
        // Delay login check to allow the dot animation to show
        setTimeout(() => {
          const success = loginWorker(selectedWorkerId, next)
          if (success) {
            setFailedAttempts(0)
            setLockedUntil(null)
            showToast('ログインしました', 'success')
            onLoginSuccess()
          } else {
            const newAttempts = failedAttempts + 1
            setFailedAttempts(newAttempts)
            if (newAttempts >= MAX_ATTEMPTS) {
              setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000)
            }
            setShaking(true)
            setTimeout(() => {
              setShaking(false)
              setPin('')
            }, 500)
            showToast('PINが正しくありません', 'error')
          }
        }, 150)
      }
      return next
    })
  }, [selectedWorkerId, loginWorker, showToast, onLoginSuccess, isLockedOut, failedAttempts])

  const handleBackspace = useCallback(() => {
    if (isLockedOut) return
    setPin((prev) => prev.slice(0, -1))
  }, [isLockedOut])

  const handleClear = useCallback(() => {
    if (isLockedOut) return
    setPin('')
  }, [isLockedOut])

  // 物理キーボード対応（PCや外付けキーボード使用時）
  useEffect(() => {
    if (!selectedWorkerId) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Escape') {
        handleBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWorkerId, handlePinDigit, handleBackspace, handleBack])

  const remainingAttempts = MAX_ATTEMPTS - failedAttempts

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
              const hasPin = worker.pin !== null && worker.pin !== ''
              const initial = worker.name.charAt(0)

              return (
                <button
                  key={worker.id}
                  type="button"
                  disabled={!hasPin}
                  onClick={() => handleWorkerSelect(worker.id, worker.pin)}
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
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="self-start flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>

          {/* Selected worker info */}
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

          {/* Lockout or remaining attempts message */}
          {isLockedOut ? (
            <div className="mb-4 text-center">
              <p className="text-sm font-bold text-red-500">
                ロックされています
              </p>
              <p className="text-xs text-red-400 mt-1">
                {lockoutRemaining}秒後に再試行できます
              </p>
            </div>
          ) : failedAttempts > 2 ? (
            <div className="mb-4 text-center">
              <p className="text-xs text-red-500">
                残り{remainingAttempts}回の試行でロックされます
              </p>
            </div>
          ) : null}

          {/* PIN dots */}
          <div
            className={`flex gap-4 mb-8 ${shaking ? 'animate-shake' : ''}`}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  i < pin.length
                    ? 'bg-mango scale-110'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={isLockedOut}
                onClick={() => handlePinDigit(digit)}
                className={`h-16 rounded-xl bg-white border border-border text-xl font-bold text-ink shadow-sm transition-all duration-100 ${
                  isLockedOut
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-mango-light hover:border-mango active:scale-95 cursor-pointer'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              disabled={isLockedOut}
              onClick={handleClear}
              className={`h-16 rounded-xl bg-white border border-border text-xs font-bold text-muted transition-all duration-100 ${
                isLockedOut
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer'
              }`}
            >
              クリア
            </button>
            <button
              type="button"
              disabled={isLockedOut}
              onClick={() => handlePinDigit('0')}
              className={`h-16 rounded-xl bg-white border border-border text-xl font-bold text-ink shadow-sm transition-all duration-100 ${
                isLockedOut
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-mango-light hover:border-mango active:scale-95 cursor-pointer'
              }`}
            >
              0
            </button>
            <button
              type="button"
              disabled={isLockedOut}
              onClick={handleBackspace}
              className={`h-16 rounded-xl bg-white border border-border flex items-center justify-center text-muted transition-all duration-100 ${
                isLockedOut
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer'
              }`}
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
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

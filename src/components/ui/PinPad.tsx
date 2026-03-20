import { useState, useCallback, useEffect } from 'react'
import { Delete } from 'lucide-react'
import { usePinLockout } from '../../hooks/usePinLockout'
import { PIN_MAX_ATTEMPTS, PIN_LOCKOUT_SECONDS } from '../../lib/constants'

interface PinPadProps {
  onComplete: (pin: string) => Promise<boolean>
  maxAttempts?: number
  lockoutSeconds?: number
  storageKey: string
  disabled?: boolean
}

export default function PinPad({
  onComplete,
  maxAttempts = PIN_MAX_ATTEMPTS,
  lockoutSeconds = PIN_LOCKOUT_SECONDS,
  storageKey,
  disabled = false,
}: PinPadProps) {
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)

  const {
    isLockedOut,
    failedAttempts,
    remainingAttempts,
    lockoutRemaining,
    recordFailure,
    resetLockout,
  } = usePinLockout({ maxAttempts, lockoutSeconds, storageKey })

  const isDisabled = disabled || isLockedOut

  const handlePinDigit = useCallback((digit: string) => {
    if (isDisabled) return
    setPin((prev) => {
      if (prev.length >= 4) return prev
      const next = prev + digit
      if (next.length === 4) {
        setTimeout(async () => {
          const success = await onComplete(next)
          if (success) {
            setPin('')
            resetLockout()
          } else {
            recordFailure()
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
  }, [isDisabled, onComplete, recordFailure, resetLockout])

  const handleBackspace = useCallback(() => {
    if (isDisabled) return
    setPin((prev) => prev.slice(0, -1))
  }, [isDisabled])

  const handleClear = useCallback(() => {
    if (isDisabled) return
    setPin('')
  }, [isDisabled])

  // 物理キーボード対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleBackspace()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePinDigit, handleBackspace])

  const btnClass = (base: string) =>
    `h-16 rounded-xl bg-white border border-border text-xl font-bold text-ink shadow-sm transition-all duration-100 ${
      isDisabled
        ? 'opacity-40 cursor-not-allowed'
        : `${base} cursor-pointer`
    }`

  return (
    <div className="flex flex-col items-center">
      {/* ロックアウト / 残り試行回数 */}
      {isLockedOut ? (
        <div className="mb-4 text-center">
          <p className="text-sm font-bold text-red-500">ロックされています</p>
          <p className="text-xs text-red-400 mt-1">{lockoutRemaining}秒後に再試行できます</p>
        </div>
      ) : failedAttempts > 2 ? (
        <div className="mb-4 text-center">
          <p className="text-xs text-red-500">残り{remainingAttempts}回の試行でロックされます</p>
        </div>
      ) : null}

      {/* PIN ドット */}
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

      {/* テンキー */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={isDisabled}
            onClick={() => handlePinDigit(digit)}
            className={btnClass('hover:bg-mango-light hover:border-mango active:scale-95')}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleClear}
          className={`h-16 rounded-xl bg-white border border-border text-xs font-bold text-muted transition-all duration-100 ${
            isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer'
          }`}
        >
          クリア
        </button>
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => handlePinDigit('0')}
          className={btnClass('hover:bg-mango-light hover:border-mango active:scale-95')}
        >
          0
        </button>
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleBackspace}
          className={`h-16 rounded-xl bg-white border border-border flex items-center justify-center text-muted transition-all duration-100 ${
            isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer'
          }`}
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

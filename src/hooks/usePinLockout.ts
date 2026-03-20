import { useState, useEffect, useRef, useCallback } from 'react'
import { PIN_MAX_ATTEMPTS, PIN_LOCKOUT_SECONDS } from '../lib/constants'

interface UsePinLockoutOptions {
  maxAttempts?: number
  lockoutSeconds?: number
  storageKey: string
}

export function usePinLockout({
  maxAttempts = PIN_MAX_ATTEMPTS,
  lockoutSeconds = PIN_LOCKOUT_SECONDS,
  storageKey,
}: UsePinLockoutOptions) {
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.until && Date.now() < data.until) return data.attempts
      }
    } catch { /* ignore */ }
    return 0
  })

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.until && Date.now() < data.until) return data.until
      }
    } catch { /* ignore */ }
    return null
  })

  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil
  const remainingAttempts = maxAttempts - failedAttempts

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

  const recordFailure = useCallback(() => {
    const newAttempts = failedAttempts + 1
    setFailedAttempts(newAttempts)
    if (newAttempts >= maxAttempts) {
      const until = Date.now() + lockoutSeconds * 1000
      setLockedUntil(until)
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ until, attempts: newAttempts }))
      } catch { /* ignore */ }
    }
  }, [failedAttempts, maxAttempts, lockoutSeconds, storageKey])

  const resetLockout = useCallback(() => {
    setFailedAttempts(0)
    setLockedUntil(null)
  }, [])

  return {
    isLockedOut,
    failedAttempts,
    remainingAttempts,
    lockoutRemaining,
    recordFailure,
    resetLockout,
  }
}

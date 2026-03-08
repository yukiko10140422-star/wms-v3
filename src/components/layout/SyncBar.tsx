import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

interface SyncBarProps {
  status: 'idle' | 'loading' | 'ok' | 'error'
  queueLength?: number
}

export default function SyncBar({ status, queueLength = 0 }: SyncBarProps) {
  const [visible, setVisible] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading' || status === 'error') {
      setVisible(true)
    } else if (status === 'ok') {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [status])

  const barClass =
    status === 'loading'
      ? 'bg-gradient-to-r from-mango to-yellow animate-pulse'
      : status === 'ok'
        ? 'bg-green'
        : status === 'error'
          ? 'bg-red'
          : ''

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`fixed top-0 left-0 right-0 h-0.5 z-50 ${barClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red text-white text-xs font-bold flex items-center justify-center gap-2 py-1.5"
          >
            <WifiOff className="w-3.5 h-3.5" />
            オフライン — 入力は保存されます
            {queueLength > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full">
                {queueLength}件待機中
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

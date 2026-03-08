import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SyncBarProps {
  status: 'idle' | 'loading' | 'ok' | 'error'
}

export default function SyncBar({ status }: SyncBarProps) {
  const [visible, setVisible] = useState(false)

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
  )
}

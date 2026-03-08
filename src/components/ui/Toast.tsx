import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useStore } from '../../store/useStore'

type ToastType = 'success' | 'error' | 'info'

const borderColors: Record<ToastType, string> = {
  success: 'border-l-4 border-green',
  error: 'border-l-4 border-red',
  info: 'border-l-4 border-mango',
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green" />,
  error: <AlertCircle className="w-5 h-5 text-red" />,
  info: <Info className="w-5 h-5 text-mango" />,
}

export default function Toast() {
  const toast = useStore((s) => s.toast)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            layout
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 ${borderColors[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="text-sm text-ink flex-1">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

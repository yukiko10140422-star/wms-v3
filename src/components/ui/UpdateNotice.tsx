import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

const APP_VERSION = '2.1.0'
const STORAGE_KEY = 'wms-last-seen-version'

interface UpdateEntry {
  title: string
  items: string[]
}

const updates: UpdateEntry[] = [
  {
    title: 'v2.1.0 — もっと使いやすくなりました',
    items: [
      '画面の文字や色が見やすくなりました',
      'スマホで梱包の項目名がつぶれなくなりました',
      '数量を数字で直接入力できるようになりました（数字の部分をタップ）',
      '入力途中のデータが自動で保存されます（画面を閉じたり、他のアプリに切り替えても大丈夫です）',
      '使い方ガイドを追加しました（画面下の「ガイド」ボタンから見られます）',
    ],
  },
]

export default function UpdateNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (lastSeen !== APP_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem(STORAGE_KEY, APP_VERSION)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-mango to-mango-dark p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold text-lg">アップデート</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {updates.map((update, i) => (
                <div key={i} className={i > 0 ? 'mt-5 pt-5 border-t border-border' : ''}>
                  <h3 className="font-bold text-ink text-sm mb-3">{update.title}</h3>
                  <ul className="space-y-2">
                    {update.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="text-mango mt-0.5 flex-shrink-0">●</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-mango text-white font-bold text-sm hover:bg-mango-dark transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

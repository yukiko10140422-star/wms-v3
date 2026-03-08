import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'wms-last-seen-version'

interface UpdateEntry {
  version: string
  title: string
  items: string[]
}

// 新しいアップデートを一番上に追加していく
// version を上げたときだけ通知が表示される
const updates: UpdateEntry[] = [
  {
    version: '3.0',
    title: 'v3.0 — マイページ & ログイン機能',
    items: [
      '作業者ごとにPINでログインするようになりました',
      '自分専用の作業入力画面になりました（他の人を選べなくなりました）',
      'シフトの確認・変更・取り消しができるようになりました',
      '欠勤届を提出できるようになりました',
      '自分の給料明細を月別で確認できるようになりました',
      '請求書の発行が自分のページからできます',
      'PINの変更はマイページから行えます',
    ],
  },
  {
    version: '2.3',
    title: 'v2.3 — 使いやすさ大幅アップ',
    items: [
      '作業者を最初に選ぶようにフォームの順番を変えました',
      '提出後に内容の確認画面が表示されるようになりました',
      '提出直後なら「取り消す」ことができます',
      '「前回と同じ内容で入力」ボタンで入力の手間が減ります',
      '今日の提出状況（人数・金額・未提出者）が一目でわかります',
      '作業現場の写真を最大3枚まで添付できるようになりました',
      'アプリにほしい機能を送信できるようになりました（設定画面から）',
    ],
  },
  {
    version: '2.2',
    title: 'v2.2 — リアルタイム共有 & 安全性アップ',
    items: [
      '入力中のデータを別の端末からも確認できるようになりました',
      '他の人が単価や作業者を変更したとき、画面にお知らせが出るようになりました',
      '同じ人・同じ日の作業を二重に提出しようとすると確認が出ます',
      '提出するときに最新の単価で自動的に計算し直します',
    ],
  },
  {
    version: '2.1',
    title: 'v2.1 — もっと使いやすくなりました',
    items: [
      '画面の文字や色が見やすくなりました',
      'スマホで梱包の項目名がつぶれなくなりました',
      '数量を数字で直接入力できるようになりました（数字の部分をタップ）',
      '入力途中のデータが自動で保存されます（画面を閉じたり、他のアプリに切り替えても大丈夫です）',
      '使い方ガイドを追加しました（画面下の「ガイド」ボタンから見られます）',
    ],
  },
]

const LATEST_VERSION = updates[0].version

export default function UpdateNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    // バージョンが変わったときだけ表示
    if (lastSeen !== LATEST_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem(STORAGE_KEY, LATEST_VERSION)
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

            {/* Content - only show latest update */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <h3 className="font-bold text-ink text-sm mb-3">{updates[0].title}</h3>
              <ul className="space-y-2">
                {updates[0].items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-ink/80">
                    <span className="text-mango mt-0.5 flex-shrink-0">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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

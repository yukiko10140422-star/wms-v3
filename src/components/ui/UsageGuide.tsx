import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ClipboardList,
  Timer,
  Hash,
  GripVertical,
  Save,
  CalendarDays,
  Shield,
  FileText,
} from 'lucide-react'

interface UsageGuideProps {
  open: boolean
  onClose: () => void
}

interface GuideSection {
  icon: React.ReactNode
  title: string
  steps: string[]
}

const sections: GuideSection[] = [
  {
    icon: <ClipboardList className="w-5 h-5 text-mango" />,
    title: '作業入力の流れ',
    steps: [
      '作業日を選択します',
      '作業者を選択します（チップをタップ）',
      '梱包オプションの数量を入力します',
      '必要に応じてボーナス上乗せをONにします',
      '「提出する」ボタンで送信します',
    ],
  },
  {
    icon: <Hash className="w-5 h-5 text-mango" />,
    title: '数量の入力方法',
    steps: [
      '＋/－ ボタンで1つずつ増減できます',
      'ボタン長押しで連続カウントできます',
      '数字部分をタップすると直接入力できます（大量入力向き）',
    ],
  },
  {
    icon: <GripVertical className="w-5 h-5 text-mango" />,
    title: '梱包オプションの並べ替え',
    steps: [
      '左側の ⠿ マークを長押しします',
      'そのままドラッグして好きな順番に並べ替えます',
      '並べ替えた順番は自動で保存されます',
    ],
  },
  {
    icon: <Timer className="w-5 h-5 text-mango" />,
    title: 'タイマーの使い方',
    steps: [
      '▶ で作業開始、⏸ で休憩、繰り返し可能です',
      '✓ を押すと経過時間が「会議・他業務」に反映されます',
      '↺ でリセットできます（確認あり）',
    ],
  },
  {
    icon: <Save className="w-5 h-5 text-mango" />,
    title: '自動保存について',
    steps: [
      '入力中のデータは自動でスマホに保存されます',
      'タブを切り替えたり、画面が消えても安心です',
      '提出が完了すると自動的にクリアされます',
      'タイマーのデータは24時間後に自動で消えます',
    ],
  },
  {
    icon: <CalendarDays className="w-5 h-5 text-mango" />,
    title: 'シフト希望',
    steps: [
      '画面下の「シフト」タブを選択します',
      'カレンダーから出勤希望日をタップして選択します',
      '「提出する」ボタンで送信します',
    ],
  },
  {
    icon: <Shield className="w-5 h-5 text-mango" />,
    title: '管理者メニュー',
    steps: [
      '画面下の「管理者」タブをタップします',
      'パスワードを入力してロック解除します',
      '履歴・明細、シフト管理、設定にアクセスできます',
    ],
  },
  {
    icon: <FileText className="w-5 h-5 text-mango" />,
    title: '履歴・明細（管理者）',
    steps: [
      '作業者・月で絞り込みができます',
      '明細書の印刷・PDF出力が可能です',
      'CSVエクスポートにも対応しています',
    ],
  },
]

export default function UsageGuide({ open, onClose }: UsageGuideProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[85vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥭</span>
                <h2 className="font-bold text-lg text-ink">使い方ガイド</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-mango-light transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {sections.map((section, i) => (
                <div key={i} className="bg-background rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {section.icon}
                    <h3 className="font-bold text-sm text-ink">{section.title}</h3>
                  </div>
                  <ol className="space-y-1.5">
                    {section.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="text-mango font-mono font-bold text-xs mt-0.5 flex-shrink-0 w-5 text-right">
                          {j + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}

              <p className="text-xs text-muted text-center pt-2">
                WMS v2.1.0 — World Mango System
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

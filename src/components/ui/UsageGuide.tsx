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
  LogIn,
  Wallet,
  User,
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
    icon: <LogIn className="w-5 h-5 text-mango" />,
    title: 'ログイン',
    steps: [
      '自分の名前をタップします',
      '4桁のPINを入力します（初期値は1234）',
      'PINはマイページから変更できます',
      'キーボードでも数字入力できます（PCの場合）',
    ],
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-mango" />,
    title: '作業入力の流れ',
    steps: [
      '作業日と住所を確認します（自動入力済み）',
      '梱包オプションの数量を入力します',
      '必要に応じてボーナス上乗せをONにします',
      '写真を最大3枚まで添付できます',
      '「提出する」ボタンで送信します',
      '提出直後なら「取り消す」ことができます',
      '消しゴムボタンで入力内容をリセットできます',
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
    title: '自動保存・オフライン',
    steps: [
      '入力中のデータは自動でスマホに保存されます',
      'タブを切り替えたり、画面が消えても安心です',
      '提出が完了すると自動的にクリアされます',
      '圏外でも提出できます（接続時に自動送信）',
      'タイマーのデータは24時間後に自動で消えます',
    ],
  },
  {
    icon: <CalendarDays className="w-5 h-5 text-mango" />,
    title: 'シフト・欠勤届',
    steps: [
      '画面下の「シフト」タブを選択します',
      '「シフト希望」タブからカレンダーで出勤日を選んで提出',
      '「提出済み」タブで提出内容の確認・変更・取り消しができます',
      '「欠勤届」タブからお休みの届出と理由を提出できます',
      '「カレンダー」タブでシフト予定・出勤実績・欠勤が一覧できます',
    ],
  },
  {
    icon: <Wallet className="w-5 h-5 text-mango" />,
    title: '給料明細',
    steps: [
      '画面下の「給料」タブを選択します',
      '月を選ぶと承認済みの合計・日数・保留件数が見えます',
      '各記録をタップすると加工の内訳が確認できます',
      '「請求書」ボタンで請求書を印刷・PDF保存できます',
    ],
  },
  {
    icon: <User className="w-5 h-5 text-mango" />,
    title: 'マイページ',
    steps: [
      '画面下の「マイページ」タブを選択します',
      'PINの変更ができます',
      'ログアウトはここから行います',
    ],
  },
  {
    icon: <Shield className="w-5 h-5 text-mango" />,
    title: '管理者メニュー',
    steps: [
      '画面下の「管理者」タブをタップします',
      'パスワードを入力してロック解除します',
      '履歴・明細、シフト管理、設定にアクセスできます',
      'ログイン画面の「管理者としてログイン」からもアクセス可能です',
    ],
  },
  {
    icon: <FileText className="w-5 h-5 text-mango" />,
    title: '履歴・請求書（管理者）',
    steps: [
      '作業者・月・ステータスで絞り込みができます',
      '日付や金額で並べ替えできます',
      '個別の記録からも請求書を印刷できます',
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
          style={{ padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) 0px env(safe-area-inset-left, 0px)' }}
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
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                WMS v3.0 — World Mango System
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

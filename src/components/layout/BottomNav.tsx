import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, CalendarDays, Wallet, User, Shield, FileText, Users, Settings, X, Sun, Moon, Monitor } from 'lucide-react'
import type { Theme } from '../../hooks/useTheme'

interface BottomNavProps {
  currentPage: string
  onNavigate: (page: string) => void
  onRequestAdmin: (page: string) => void
  onOpenGuide: () => void
  adminUnlocked: boolean
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
}

const mainItems = [
  { id: 'work', label: '作業入力', icon: ClipboardList },
  { id: 'my-shifts', label: 'シフト', icon: CalendarDays },
  { id: 'my-salary', label: '給料', icon: Wallet },
  { id: 'my-settings', label: 'マイページ', icon: User },
]

const adminMenuItems = [
  { id: 'history', label: '履歴・明細', icon: FileText },
  { id: 'shift-manage', label: 'シフト管理', icon: Users },
  { id: 'settings', label: '設定', icon: Settings },
]

export default function BottomNav({ currentPage, onNavigate, onRequestAdmin, onOpenGuide, adminUnlocked, theme, onThemeChange }: BottomNavProps) {
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  const handleAdminItemClick = (id: string) => {
    setShowAdminMenu(false)
    if (adminUnlocked) {
      onNavigate(id)
    } else {
      onRequestAdmin(id)
    }
  }

  return (
    <>
      {/* Admin Menu Sheet */}
      <AnimatePresence>
        {showAdminMenu && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAdminMenu(false)} />
            <motion.div
              className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 pb-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-ink text-sm">管理者メニュー</h3>
                <button onClick={() => setShowAdminMenu(false)} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              <div className="space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAdminItemClick(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-colors cursor-pointer
                        ${currentPage === item.id ? 'bg-mango-light text-mango-dark font-bold' : 'text-ink hover:bg-mango-light'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Theme Toggle */}
              {onThemeChange && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[10px] font-bold text-muted mb-2">テーマ</div>
                  <div className="flex items-center gap-1 bg-cream rounded-lg p-1">
                    {([
                      { value: 'light' as Theme, icon: <Sun className="w-3.5 h-3.5" />, label: '明るい' },
                      { value: 'system' as Theme, icon: <Monitor className="w-3.5 h-3.5" />, label: '自動' },
                      { value: 'dark' as Theme, icon: <Moon className="w-3.5 h-3.5" />, label: '暗い' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onThemeChange(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs cursor-pointer transition-all ${
                          theme === opt.value ? 'bg-white shadow-sm font-bold text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-border shadow-lg z-30">
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer
                  transition-colors
                  ${isActive ? 'text-mango' : 'text-muted'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            )
          })}

          {/* Admin Button */}
          <button
            onClick={() => setShowAdminMenu(true)}
            className={`
              flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer
              transition-colors
              ${['history', 'shift-manage', 'settings'].includes(currentPage) ? 'text-mango' : 'text-muted'}
            `}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">管理者</span>
          </button>
        </div>
      </nav>
    </>
  )
}

import { ClipboardList, CalendarDays, FileText, Users, Settings, Lock, HelpCircle, Sun, Moon, Monitor } from 'lucide-react'
import type { Theme } from '../../hooks/useTheme'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  onRequestAdmin: (page: string) => void
  onOpenGuide: () => void
  adminUnlocked: boolean
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  admin?: boolean
}

const generalItems: NavItem[] = [
  { id: 'work', label: '作業入力', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'shift-request', label: 'シフト希望', icon: <CalendarDays className="w-5 h-5" /> },
]

const adminItems: NavItem[] = [
  { id: 'history', label: '履歴・明細', icon: <FileText className="w-5 h-5" />, admin: true },
  { id: 'shift-manage', label: 'シフト管理', icon: <Users className="w-5 h-5" />, admin: true },
  { id: 'settings', label: '設定', icon: <Settings className="w-5 h-5" />, admin: true },
]

export default function Sidebar({ currentPage, onNavigate, onRequestAdmin, onOpenGuide, adminUnlocked, theme, onThemeChange }: SidebarProps) {
  const handleClick = (item: NavItem) => {
    if (item.admin && !adminUnlocked) {
      onRequestAdmin(item.id)
    } else {
      onNavigate(item.id)
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-mango-dark via-mango to-amber-500 text-white sticky top-0 h-screen">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥭</span>
          <div>
            <div className="font-black text-xl leading-tight">WMS</div>
            <div className="text-xs opacity-60">World Mango System</div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="w-2 h-2 rounded-full bg-green-300" />
          <span>同期済み</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6">
        {/* General Section */}
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-40 px-3 mb-2">一般</div>
          <div className="space-y-1">
            {generalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-150 cursor-pointer
                  hover:bg-white/15
                  ${currentPage === item.id ? 'bg-white/20 font-bold' : ''}
                `}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-40 px-3 mb-2">管理者</div>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-150 cursor-pointer
                  hover:bg-white/15
                  ${currentPage === item.id ? 'bg-white/20 font-bold' : ''}
                `}
              >
                {item.icon}
                <span className="text-sm flex-1 text-left">{item.label}</span>
                {!adminUnlocked && <Lock className="w-3.5 h-3.5 opacity-50" />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Guide */}
      <div className="px-3 mb-2">
        <button
          onClick={onOpenGuide}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer hover:bg-white/15"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm">使い方ガイド</span>
        </button>
      </div>

      {/* Theme Toggle */}
      {onThemeChange && (
        <div className="px-3 mb-2">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {([
              { value: 'light' as Theme, icon: <Sun className="w-3.5 h-3.5" />, label: '明' },
              { value: 'system' as Theme, icon: <Monitor className="w-3.5 h-3.5" />, label: '自動' },
              { value: 'dark' as Theme, icon: <Moon className="w-3.5 h-3.5" />, label: '暗' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => onThemeChange(opt.value)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] cursor-pointer transition-all ${
                  theme === opt.value ? 'bg-white/25 font-bold' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-4 text-[10px] opacity-30">
        WMS v2.3
      </div>
    </aside>
  )
}

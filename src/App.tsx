import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import SyncBar from './components/layout/SyncBar'
import AdminGuard from './components/layout/AdminGuard'
import Toast from './components/ui/Toast'
import UpdateNotice from './components/ui/UpdateNotice'
import UsageGuide from './components/ui/UsageGuide'
import { useOfflineQueue } from './hooks/useOfflineQueue'
import { useTheme } from './hooks/useTheme'
import Login from './pages/Login'
import WorkSubmit from './pages/WorkSubmit'
import MyShifts from './pages/MyShifts'
import MySalary from './pages/MySalary'
import MySettings from './pages/MySettings'
import History from './pages/History'
import ShiftAdmin from './pages/ShiftAdmin'
import Settings from './pages/Settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState('work')
  const [showAdminGuard, setShowAdminGuard] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [pendingAdminPage, setPendingAdminPage] = useState<string | null>(null)

  const fetchAll = useStore((s) => s.fetchAll)
  const subscribeRealtime = useStore((s) => s.subscribeRealtime)
  const unsubscribeRealtime = useStore((s) => s.unsubscribeRealtime)
  const syncStatus = useStore((s) => s.syncStatus)
  const adminUnlocked = useStore((s) => s.adminUnlocked)
  const unlockAdmin = useStore((s) => s.unlockAdmin)
  const loggedInWorker = useStore((s) => s.loggedInWorker)
  const restoreWorkerSession = useStore((s) => s.restoreWorkerSession)
  const workerSessionLoaded = useStore((s) => s.workerSessionLoaded)
  const logoutWorker = useStore((s) => s.logoutWorker)

  const { queueLength } = useOfflineQueue()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchAll()
      .then(() => {
        restoreWorkerSession()
      })
      .catch(() => {
        // fetchAll失敗時もセッション読み込み完了とし、ログイン画面を表示
        restoreWorkerSession()
      })
    subscribeRealtime()
    return () => unsubscribeRealtime()
  }, [fetchAll, subscribeRealtime, unsubscribeRealtime, restoreWorkerSession])

  // タブ復帰時にデータを再取得（放置後の古いデータ防止）
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAll()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchAll])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleRequestAdmin = (page: string) => {
    setPendingAdminPage(page)
    setShowAdminGuard(true)
  }

  const handleUnlock = (password: string): boolean => {
    const success = unlockAdmin(password)
    if (success) {
      if (pendingAdminPage) {
        setCurrentPage(pendingAdminPage)
        setPendingAdminPage(null)
      }
      setShowAdminGuard(false)
    }
    return success
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'work':
        return <WorkSubmit />
      case 'my-shifts':
        return <MyShifts />
      case 'my-salary':
        return <MySalary />
      case 'my-settings':
        return <MySettings onLogout={() => { logoutWorker(); setCurrentPage('work') }} />
      case 'history':
        return <History />
      case 'shift-manage':
        return <ShiftAdmin />
      case 'settings':
        return <Settings />
      default:
        return <WorkSubmit />
    }
  }

  if (!workerSessionLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-mango border-t-transparent" />
      </div>
    )
  }

  if (!loggedInWorker && !adminUnlocked) {
    return (
      <div className="min-h-screen bg-background text-ink font-sans">
        <Login
          onLoginSuccess={() => setCurrentPage('work')}
          onAdminAccess={() => {
            setPendingAdminPage('settings')
            setShowAdminGuard(true)
          }}
        />
        <AdminGuard
          open={showAdminGuard}
          onClose={() => {
            setShowAdminGuard(false)
            setPendingAdminPage(null)
          }}
          onUnlock={handleUnlock}
        />
        <Toast />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      <SyncBar status={syncStatus} queueLength={queueLength} />

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onRequestAdmin={handleRequestAdmin}
          onOpenGuide={() => setShowGuide(true)}
          adminUnlocked={adminUnlocked}
          theme={theme}
          onThemeChange={setTheme}
          workerName={loggedInWorker?.name}
          workerAvatar={loggedInWorker?.avatar}
        />

        <main className="flex-1 min-h-screen pb-20 lg:pb-0">
          <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
            {renderPage()}
          </div>
        </main>
      </div>

      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onRequestAdmin={handleRequestAdmin}
        onOpenGuide={() => setShowGuide(true)}
        adminUnlocked={adminUnlocked}
        theme={theme}
        onThemeChange={setTheme}
      />

      <AdminGuard
        open={showAdminGuard}
        onClose={() => {
          setShowAdminGuard(false)
          setPendingAdminPage(null)
        }}
        onUnlock={handleUnlock}
      />

      <UpdateNotice />
      <UsageGuide open={showGuide} onClose={() => setShowGuide(false)} />
      <Toast />
    </div>
  )
}

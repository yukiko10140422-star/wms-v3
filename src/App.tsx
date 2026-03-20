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
  const loginWorkerAsAdmin = useStore((s) => s.loginWorkerAsAdmin)
  const workers = useStore((s) => s.workers)
  const records = useStore((s) => s.records)
  const shifts = useStore((s) => s.shifts)

  // 未承認件数（records + shifts の pending 合計）
  const pendingCount = records.filter((r) => r.status === 'pending').length
    + shifts.filter((s) => s.status === 'pending').length

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

  const handleUnlock = async (password: string): Promise<boolean> => {
    const success = await unlockAdmin(password)
    if (success) {
      setCurrentPage(pendingAdminPage || 'settings')
      setPendingAdminPage(null)
      setShowAdminGuard(false)
    }
    return success
  }

  const workerPages = ['work', 'my-shifts', 'my-salary', 'my-settings']

  const renderWorkerPicker = () => (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🥭</div>
        <h2 className="text-xl font-bold text-ink">作業者を選択</h2>
        <p className="text-sm text-muted mt-1">作業者としてログインしてください</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {workers.map((worker) => {
          const initial = worker.name.charAt(0)
          return (
            <button
              key={worker.id}
              type="button"
              onClick={() => {
                loginWorkerAsAdmin(worker.id)
                setCurrentPage('work')
              }}
              className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 bg-white border border-border shadow-sm hover:shadow-md hover:border-mango cursor-pointer active:scale-95 transition-all duration-150"
            >
              {worker.avatar ? (
                <img src={worker.avatar} alt={worker.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-xl font-bold">
                  {initial}
                </div>
              )}
              <span className="text-sm font-medium text-ink truncate w-full text-center">
                {worker.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderPage = () => {
    // 管理者モードで作業者未ログイン → 作業者ページは作業者選択を表示
    if (!loggedInWorker && adminUnlocked && workerPages.includes(currentPage)) {
      return renderWorkerPicker()
    }

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
    <div className="min-h-screen bg-background text-ink font-sans overflow-x-hidden max-w-full">
      <SyncBar status={syncStatus} queueLength={queueLength} />

      <div className="flex max-w-full">
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
          onLogout={() => { logoutWorker(); setCurrentPage('settings') }}
          onSwitchWorker={() => { logoutWorker(); setCurrentPage('work') }}
          pendingCount={pendingCount}
        />

        <main className="flex-1 min-w-0 min-h-screen pb-20 lg:pb-0 safe-top">
          <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
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
        workerName={loggedInWorker?.name}
        onLogout={() => { logoutWorker(); setCurrentPage('settings') }}
        onSwitchWorker={() => { logoutWorker(); setCurrentPage('work') }}
        pendingCount={pendingCount}
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

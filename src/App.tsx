import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import SyncBar from './components/layout/SyncBar'
import AdminGuard from './components/layout/AdminGuard'
import Toast from './components/ui/Toast'
import WorkSubmit from './pages/WorkSubmit'
import ShiftRequest from './pages/ShiftRequest'
import History from './pages/History'
import ShiftAdmin from './pages/ShiftAdmin'
import Settings from './pages/Settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState('work')
  const [showAdminGuard, setShowAdminGuard] = useState(false)
  const [pendingAdminPage, setPendingAdminPage] = useState<string | null>(null)

  const fetchAll = useStore((s) => s.fetchAll)
  const subscribeRealtime = useStore((s) => s.subscribeRealtime)
  const unsubscribeRealtime = useStore((s) => s.unsubscribeRealtime)
  const syncStatus = useStore((s) => s.syncStatus)
  const adminUnlocked = useStore((s) => s.adminUnlocked)
  const unlockAdmin = useStore((s) => s.unlockAdmin)

  useEffect(() => {
    fetchAll()
    subscribeRealtime()
    return () => unsubscribeRealtime()
  }, [fetchAll, subscribeRealtime, unsubscribeRealtime])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleRequestAdmin = (page: string) => {
    setPendingAdminPage(page)
    setShowAdminGuard(true)
  }

  const handleUnlock = (password: string): boolean => {
    const success = unlockAdmin(password)
    if (success && pendingAdminPage) {
      setCurrentPage(pendingAdminPage)
      setPendingAdminPage(null)
      setShowAdminGuard(false)
    }
    return success
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'work':
        return <WorkSubmit />
      case 'shift-request':
        return <ShiftRequest />
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

  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      <SyncBar status={syncStatus} />

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onRequestAdmin={handleRequestAdmin}
          adminUnlocked={adminUnlocked}
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
        adminUnlocked={adminUnlocked}
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

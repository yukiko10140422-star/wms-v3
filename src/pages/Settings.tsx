import { useState } from 'react'
import { useStore } from '../store/useStore'
import CompanyForm from '../components/settings/CompanyForm'
import PasswordForm from '../components/settings/PasswordForm'
import WorkerManager from '../components/settings/WorkerManager'
import PriceManager from '../components/settings/PriceManager'
import Button from '../components/ui/Button'
import FeatureRequestForm from '../components/settings/FeatureRequestForm'
import FeatureRequestList from '../components/settings/FeatureRequestList'

export default function Settings() {
  const {
    settings,
    workers,
    processes,
    updateSettings,
    addWorker,
    updateWorker,
    deleteWorker,
    addProcess,
    updateProcess,
    deleteProcess,
    showToast,
  } = useStore()

  const [bonusRate, setBonusRate] = useState(settings?.bonus_rate || 10)
  const [hourlyRate, setHourlyRate] = useState(settings?.hourly_rate || 1200)
  const [savingBonus, setSavingBonus] = useState(false)
  const [savingHourly, setSavingHourly] = useState(false)

  if (!settings) {
    return (
      <div className="text-muted text-sm py-4">
        設定を読み込み中...
      </div>
    )
  }

  const handleSaveBonusRate = async () => {
    const val = Math.max(1, Math.min(100, bonusRate))
    setSavingBonus(true)
    await updateSettings({ bonus_rate: val })
    setSavingBonus(false)
  }

  const handleChangePassword = async (newPassword: string) => {
    await updateSettings({ admin_pw: newPassword })
    showToast('PINを変更しました', 'success')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-ink">設定</h2>
        <p className="text-sm text-muted mt-1">
          会社情報・外注さん管理・単価・PIN
        </p>
      </div>

      {/* 1. Company Info */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <CompanyForm settings={settings} onSave={updateSettings} />
      </div>

      {/* 2. Bonus Rate */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
          上乗せ率デフォルト
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs font-bold text-muted">
            デフォルト上乗せ率
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={bonusRate}
              onChange={(e) =>
                setBonusRate(parseInt(e.target.value) || 10)
              }
              min={1}
              max={100}
              className="w-20 px-3 py-2 border border-border rounded-lg text-sm text-center font-mono focus:border-mango outline-none"
            />
            <span className="text-sm text-muted">%</span>
          </div>
        </div>
        <Button
          variant="primary"
          loading={savingBonus}
          onClick={handleSaveBonusRate}
        >
          保存
        </Button>
      </div>

      {/* 2.5. Hourly Rate */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
          時給設定
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs font-bold text-muted">
            会議・他業務の時給
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">¥</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) =>
                setHourlyRate(parseInt(e.target.value) || 1200)
              }
              min={100}
              step={100}
              className="w-24 px-3 py-2 border border-border rounded-lg text-sm text-center font-mono focus:border-mango outline-none"
            />
          </div>
        </div>
        <Button
          variant="primary"
          loading={savingHourly}
          onClick={async () => {
            const val = Math.max(100, hourlyRate)
            setSavingHourly(true)
            await updateSettings({ hourly_rate: val })
            setSavingHourly(false)
          }}
        >
          保存
        </Button>
      </div>

      {/* 3. Worker Manager */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <WorkerManager
          workers={workers}
          onAdd={addWorker}
          onUpdate={updateWorker}
          onDelete={deleteWorker}
        />
      </div>

      {/* 4. Price Manager */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <PriceManager
          processes={processes}
          onUpdate={updateProcess}
          onDelete={deleteProcess}
          onAdd={addProcess}
        />
      </div>

      {/* 5. Password */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <PasswordForm onSave={handleChangePassword} />
      </div>

      {/* 6. Feature Request - Submit */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <FeatureRequestForm />
      </div>

      {/* 7. Feature Request - Admin List */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <FeatureRequestList />
      </div>
    </div>
  )
}

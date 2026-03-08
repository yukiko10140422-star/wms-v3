import { useState, useCallback, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import WorkerPicker from '../components/work/WorkerPicker'
import ProcessList from '../components/work/ProcessList'
import BonusToggle from '../components/work/BonusToggle'
import Timer from '../components/work/Timer'
import TotalPanel from '../components/work/TotalPanel'
import Button from '../components/ui/Button'
import type { Worker, WorkItem, TimerLogEntry } from '../lib/types'

const DRAFT_KEY = 'wms-worksubmit-draft'

interface FormDraft {
  workerId: string | null
  workDate: string
  address: string
  remarks: string
  bonusOn: boolean
  bonusRate: number
}

function loadDraft(): FormDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraft(draft: FormDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch { /* ignore */ }
}

function clearAllDrafts() {
  localStorage.removeItem(DRAFT_KEY)
  localStorage.removeItem('wms-quantities-draft')
  localStorage.removeItem('wms-hourly-draft')
  localStorage.removeItem('wms-timer-draft')
}

export default function WorkSubmit() {
  const workers = useStore((s) => s.workers)
  const settings = useStore((s) => s.settings)
  const addRecord = useStore((s) => s.addRecord)
  const showToast = useStore((s) => s.showToast)

  const draft = useRef(loadDraft()).current

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [workDate, setWorkDate] = useState(() => draft?.workDate || new Date().toISOString().split('T')[0])
  const [address, setAddress] = useState(() => draft?.address || '')
  const [remarks, setRemarks] = useState(() => draft?.remarks || '')
  const [bonusOn, setBonusOn] = useState(() => draft?.bonusOn ?? false)
  const [bonusRate, setBonusRate] = useState(() => draft?.bonusRate ?? settings?.bonus_rate ?? 10)
  const [items, setItems] = useState<WorkItem[]>([])
  const [baseTotal, setBaseTotal] = useState(0)
  const [timerData, setTimerData] = useState<{
    hours: number
    timer_work_ms: number
    timer_log: TimerLogEntry[]
  } | null>(null)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [resetSignal, setResetSignal] = useState(0)

  // 下書きから作業者を復元（workers読み込み後）
  useEffect(() => {
    if (draft?.workerId && workers.length > 0 && !selectedWorker) {
      const found = workers.find((w) => w.id === draft.workerId)
      if (found) {
        setSelectedWorker(found)
        if (!address) setAddress(found.address || '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workers])

  // フォーム変更時にlocalStorageへ保存
  useEffect(() => {
    saveDraft({
      workerId: selectedWorker?.id ?? null,
      workDate,
      address,
      remarks,
      bonusOn,
      bonusRate,
    })
  }, [selectedWorker, workDate, address, remarks, bonusOn, bonusRate])

  const handleWorkerSelect = useCallback((worker: Worker) => {
    setSelectedWorker(worker)
    setAddress(worker.address || '')
  }, [])

  const handleItemsChange = useCallback((newItems: WorkItem[], newBaseTotal: number) => {
    setItems(newItems)
    setBaseTotal(newBaseTotal)
  }, [])

  const handleTimerApply = useCallback(
    (result: { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] }) => {
      setTimerData(result)
      const logText = result.timer_log
        .map((e) => `${e.time} ${e.type}`)
        .join(' / ')
      setRemarks((prev) => (prev ? `${prev}\n[タイマー] ${logText}` : `[タイマー] ${logText}`))
      showToast('タイマーを反映しました', 'success')
    },
    [showToast]
  )

  const bonusAmt = bonusOn ? Math.round(baseTotal * (bonusRate / 100)) : 0
  const total = baseTotal + bonusAmt

  const handleSubmit = async () => {
    if (!selectedWorker) {
      showToast('作業者を選択してください', 'error')
      return
    }
    if (items.length === 0) {
      showToast('加工内容を入力してください', 'error')
      return
    }

    setSubmitState('submitting')

    try {
      await addRecord({
        date: workDate,
        worker_name: selectedWorker.name,
        address,
        remarks,
        avatar: selectedWorker.avatar || '',
        bonus_on: bonusOn,
        bonus_amt: bonusAmt,
        bonus_rate: bonusRate,
        items,
        base_total: baseTotal,
        total,
        hours: timerData?.hours ?? 0,
        timer_log: timerData?.timer_log ?? [],
        timer_work_ms: timerData?.timer_work_ms ?? 0,
        status: 'pending',
      })

      setSubmitState('done')

      // Reset form after brief delay
      setTimeout(() => {
        setSelectedWorker(null)
        setWorkDate(new Date().toISOString().split('T')[0])
        setAddress('')
        setRemarks('')
        setBonusOn(false)
        setItems([])
        setBaseTotal(0)
        setTimerData(null)
        setSubmitState('idle')
        setResetSignal((s) => s + 1)
        clearAllDrafts()
      }, 1500)
    } catch {
      setSubmitState('idle')
      showToast('提出に失敗しました', 'error')
    }
  }

  const buttonText =
    submitState === 'submitting'
      ? '提出中...'
      : submitState === 'done'
        ? '提出しました'
        : '提出する'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black">作業入力</h2>
        <p className="text-sm text-muted mt-0.5">作業内容を入力して提出します</p>
      </div>

      {/* Work Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">作業日</label>
        <input
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10"
        />
      </div>

      {/* Worker Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">作業者</label>
        <WorkerPicker
          workers={workers}
          selectedId={selectedWorker?.id ?? null}
          onSelect={handleWorkerSelect}
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">住所</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="作業先の住所"
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10"
        />
      </div>

      {/* Process List */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">加工内容</label>
        <div className="bg-white rounded-xl border border-border p-3">
          <ProcessList onItemsChange={handleItemsChange} resetSignal={resetSignal} />
        </div>
      </div>

      {/* Bonus Toggle */}
      <div className="bg-white rounded-xl border border-border p-4">
        <BonusToggle
          enabled={bonusOn}
          rate={bonusRate}
          onToggle={() => setBonusOn((prev) => !prev)}
          onRateChange={setBonusRate}
        />
      </div>

      {/* Timer */}
      <Timer onApply={handleTimerApply} />

      {/* Remarks */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">備考</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="備考があれば入力してください"
          rows={3}
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10 resize-y"
        />
      </div>

      {/* Total Panel */}
      <TotalPanel
        items={items}
        baseTotal={baseTotal}
        bonusOn={bonusOn}
        bonusRate={bonusRate}
      />

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={submitState === 'submitting'}
        disabled={submitState === 'done'}
        onClick={handleSubmit}
      >
        {buttonText}
      </Button>
    </div>
  )
}

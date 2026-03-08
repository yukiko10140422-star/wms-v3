import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import WorkerPicker from '../components/work/WorkerPicker'
import ProcessList from '../components/work/ProcessList'
import BonusToggle from '../components/work/BonusToggle'
import Timer from '../components/work/Timer'
import TotalPanel from '../components/work/TotalPanel'
import Button from '../components/ui/Button'
import type { Worker, WorkItem, TimerLogEntry } from '../lib/types'

export default function WorkSubmit() {
  const workers = useStore((s) => s.workers)
  const settings = useStore((s) => s.settings)
  const addRecord = useStore((s) => s.addRecord)
  const showToast = useStore((s) => s.showToast)

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split('T')[0])
  const [address, setAddress] = useState('')
  const [remarks, setRemarks] = useState('')
  const [bonusOn, setBonusOn] = useState(false)
  const [bonusRate, setBonusRate] = useState(() => settings?.bonus_rate ?? 10)
  const [items, setItems] = useState<WorkItem[]>([])
  const [baseTotal, setBaseTotal] = useState(0)
  const [timerData, setTimerData] = useState<{
    hours: number
    timer_work_ms: number
    timer_log: TimerLogEntry[]
  } | null>(null)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle')

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
          <ProcessList onItemsChange={handleItemsChange} />
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

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, RotateCcw, ClipboardCheck } from 'lucide-react'
import { useStore } from '../store/useStore'
import WorkerPicker from '../components/work/WorkerPicker'
import ProcessList from '../components/work/ProcessList'
import BonusToggle from '../components/work/BonusToggle'
import Timer from '../components/work/Timer'
import TotalPanel from '../components/work/TotalPanel'
import Button from '../components/ui/Button'
import LiveDrafts from '../components/work/LiveDrafts'
import PhotoAttach from '../components/work/PhotoAttach'
import type { Worker, WorkItem, TimerLogEntry, Draft } from '../lib/types'

const DRAFT_KEY = 'wms-worksubmit-draft'
const LAST_SUBMIT_KEY = 'wms-last-submit'

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

function saveLocalDraft(draft: FormDraft) {
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

// 端末識別子（localStorage に永続化）
function getDeviceId(): string {
  const key = 'wms-device-id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = 'd' + Date.now() + Math.random().toString(36).slice(2, 6)
    localStorage.setItem(key, id)
  }
  return id
}

const deviceId = getDeviceId()

export default function WorkSubmit() {
  const workers = useStore((s) => s.workers)
  const processes = useStore((s) => s.processes)
  const records = useStore((s) => s.records)
  const settings = useStore((s) => s.settings)
  const addRecord = useStore((s) => s.addRecord)
  const deleteRecord = useStore((s) => s.deleteRecord)
  const showToast = useStore((s) => s.showToast)
  const saveDraftToServer = useStore((s) => s.saveDraft)
  const deleteDraftFromServer = useStore((s) => s.deleteDraft)

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
  const [photos, setPhotos] = useState<string[]>([])
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [resetSignal, setResetSignal] = useState(0)
  const [importData, setImportData] = useState<{ quantities: Record<string, number>; hourlyHours: number } | null>(null)
  const [submittedSummary, setSubmittedSummary] = useState<{
    recordId: number
    workerName: string
    date: string
    items: WorkItem[]
    baseTotal: number
    bonusAmt: number
    total: number
  } | null>(null)

  // マスタデータ変更検知用
  const [masterChanged, setMasterChanged] = useState(false)
  const prevProcessesRef = useRef<string>('')
  const prevWorkersRef = useRef<string>('')
  const hasInput = items.length > 0 || selectedWorker !== null

  // 工程・作業者のマスタ変更を検知
  useEffect(() => {
    const processesKey = processes.map((p) => `${p.id}:${p.price}:${p.name}`).join(',')
    const workersKey = workers.map((w) => w.id).join(',')

    if (prevProcessesRef.current && prevProcessesRef.current !== processesKey && hasInput) {
      setMasterChanged(true)
    }
    if (prevWorkersRef.current && prevWorkersRef.current !== workersKey && hasInput) {
      setMasterChanged(true)
      // 選択中の作業者が削除された場合
      if (selectedWorker && !workers.some((w) => w.id === selectedWorker.id)) {
        setSelectedWorker(null)
        showToast('選択していた作業者が削除されました', 'error')
      }
    }

    prevProcessesRef.current = processesKey
    prevWorkersRef.current = workersKey
  }, [processes, workers, hasInput, selectedWorker, showToast])

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
    saveLocalDraft({
      workerId: selectedWorker?.id ?? null,
      workDate,
      address,
      remarks,
      bonusOn,
      bonusRate,
    })
  }, [selectedWorker, workDate, address, remarks, bonusOn, bonusRate])

  // Supabase下書き同期（デバウンス2秒）
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      // 数量情報をlocalStorageから取得
      let quantities: Record<string, number> = {}
      let hourlyHours = 0
      try {
        const qRaw = localStorage.getItem('wms-quantities-draft')
        if (qRaw) quantities = JSON.parse(qRaw)
        const hRaw = localStorage.getItem('wms-hourly-draft')
        if (hRaw) hourlyHours = parseFloat(hRaw) || 0
      } catch { /* ignore */ }

      saveDraftToServer({
        id: deviceId,
        worker_id: selectedWorker?.id ?? null,
        worker_name: selectedWorker?.name ?? '',
        work_date: workDate,
        address,
        remarks,
        bonus_on: bonusOn,
        bonus_rate: bonusRate,
        quantities,
        hourly_hours: hourlyHours,
        base_total: baseTotal,
        device_id: deviceId,
      })
    }, 2000)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [selectedWorker, workDate, address, remarks, bonusOn, bonusRate, baseTotal, items, saveDraftToServer])

  const handleWorkerSelect = useCallback((worker: Worker) => {
    setSelectedWorker(worker)
    setAddress(worker.address || '')
  }, [])

  const handleItemsChange = useCallback((newItems: WorkItem[], newBaseTotal: number) => {
    setItems(newItems)
    setBaseTotal(newBaseTotal)
  }, [])

  // 他端末の下書きを取り込む
  const handleImportDraft = useCallback((draft: Draft) => {
    const confirmed = confirm(
      `${draft.worker_name || '（未選択）'}さんのデータを取り込みますか？\n現在の入力内容は上書きされます。`
    )
    if (!confirmed) return

    // 作業者を復元
    if (draft.worker_id) {
      const found = workers.find((w) => w.id === draft.worker_id)
      if (found) {
        setSelectedWorker(found)
        setAddress(found.address || '')
      }
    }

    // フォームフィールド復元
    if (draft.work_date) setWorkDate(draft.work_date)
    if (draft.remarks) setRemarks(draft.remarks)
    setBonusOn(draft.bonus_on)
    setBonusRate(draft.bonus_rate)

    // 数量をProcessListに反映
    setImportData({
      quantities: draft.quantities || {},
      hourlyHours: draft.hourly_hours || 0,
    })

    showToast('データを取り込みました', 'success')
  }, [workers, showToast])

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

  // 提出時に最新単価で再計算する関数
  const recalculateWithLatestPrices = (currentItems: WorkItem[]): { items: WorkItem[]; baseTotal: number } => {
    const recalculated: WorkItem[] = []
    let newBaseTotal = 0

    for (const item of currentItems) {
      if (item.isHourly) {
        recalculated.push(item)
        newBaseTotal += item.sub
        continue
      }
      // 最新の工程データから単価を取得
      const latestProcess = processes.find((p) => p.name === item.name)
      const latestPrice = latestProcess ? latestProcess.price : item.price
      const sub = latestPrice * item.qty
      recalculated.push({ ...item, price: latestPrice, sub })
      newBaseTotal += sub
    }

    return { items: recalculated, baseTotal: newBaseTotal }
  }

  const bonusAmt = bonusOn ? Math.round(baseTotal * (bonusRate / 100)) : 0
  const total = baseTotal + bonusAmt

  const handleSubmit = async () => {
    // 1. 作業者の選択チェック
    if (!selectedWorker) {
      showToast('作業者を選択してください', 'error')
      return
    }

    // 2. 作業者がまだ存在するかチェック
    if (!workers.some((w) => w.id === selectedWorker.id)) {
      showToast('この作業者は削除されたため提出できません', 'error')
      setSelectedWorker(null)
      return
    }

    // 3. 加工内容のチェック
    if (items.length === 0) {
      showToast('加工内容を入力してください', 'error')
      return
    }

    // 4. 同じ作業者・同じ日の重複チェック
    const duplicate = records.find(
      (r) => r.worker_name === selectedWorker.name && r.date === workDate
    )
    if (duplicate) {
      const confirmed = confirm(
        `${selectedWorker.name}さんの ${workDate} の記録はすでに存在します。\n重複して提出しますか？`
      )
      if (!confirmed) return
    }

    setSubmitState('submitting')

    try {
      // 5. 最新単価で再計算
      const recalc = recalculateWithLatestPrices(items)
      const finalBaseTotal = recalc.baseTotal
      const finalBonusAmt = bonusOn ? Math.round(finalBaseTotal * (bonusRate / 100)) : 0
      const finalTotal = finalBaseTotal + finalBonusAmt

      const recordId = await addRecord({
        date: workDate,
        worker_name: selectedWorker.name,
        address,
        remarks,
        avatar: selectedWorker.avatar || '',
        bonus_on: bonusOn,
        bonus_amt: finalBonusAmt,
        bonus_rate: bonusRate,
        items: recalc.items,
        base_total: finalBaseTotal,
        total: finalTotal,
        hours: timerData?.hours ?? 0,
        timer_log: timerData?.timer_log ?? [],
        timer_work_ms: timerData?.timer_work_ms ?? 0,
        photos: photos,
        status: 'pending',
      })
      if (!recordId) return

      setSubmitState('done')
      setMasterChanged(false)

      // 前回提出データをlocalStorageに保存
      try {
        localStorage.setItem(LAST_SUBMIT_KEY, JSON.stringify({
          workerId: selectedWorker.id,
          workerName: selectedWorker.name,
          address,
          bonusOn,
          bonusRate,
          quantities: (() => {
            try {
              const raw = localStorage.getItem('wms-quantities-draft')
              return raw ? JSON.parse(raw) : {}
            } catch { return {} }
          })(),
          hourlyHours: (() => {
            try {
              const raw = localStorage.getItem('wms-hourly-draft')
              return raw ? parseFloat(raw) || 0 : 0
            } catch { return 0 }
          })(),
        }))
      } catch { /* ignore */ }

      // 提出完了サマリーを表示
      setSubmittedSummary({
        recordId,
        workerName: selectedWorker.name,
        date: workDate,
        items: recalc.items,
        baseTotal: finalBaseTotal,
        bonusAmt: finalBonusAmt,
        total: finalTotal,
      })
    } catch {
      setSubmitState('idle')
      showToast('提出に失敗しました', 'error')
    }
  }

  const resetForm = useCallback(() => {
    setSubmittedSummary(null)
    setSelectedWorker(null)
    setWorkDate(new Date().toISOString().split('T')[0])
    setAddress('')
    setRemarks('')
    setBonusOn(false)
    setItems([])
    setBaseTotal(0)
    setTimerData(null)
    setPhotos([])
    setSubmitState('idle')
    setResetSignal((s) => s + 1)
    clearAllDrafts()
    deleteDraftFromServer(deviceId)
  }, [deleteDraftFromServer])

  const handleDismissSummary = resetForm

  const handleUndoSubmit = useCallback(async () => {
    if (!submittedSummary?.recordId) return
    const confirmed = confirm('この提出を取り消しますか？')
    if (!confirmed) return
    await deleteRecord(submittedSummary.recordId)
    setSubmittedSummary(null)
    setSubmitState('idle')
    showToast('提出を取り消しました', 'info')
  }, [submittedSummary, deleteRecord, showToast])

  const hasLastSubmit = (() => {
    try { return !!localStorage.getItem(LAST_SUBMIT_KEY) } catch { return false }
  })()

  const handleLoadLastSubmit = useCallback(() => {
    try {
      const raw = localStorage.getItem(LAST_SUBMIT_KEY)
      if (!raw) return
      const last = JSON.parse(raw)

      // 作業者を復元
      if (last.workerId) {
        const found = workers.find((w) => w.id === last.workerId)
        if (found) {
          setSelectedWorker(found)
          setAddress(found.address || last.address || '')
        }
      }

      setBonusOn(last.bonusOn ?? false)
      setBonusRate(last.bonusRate ?? 10)

      // 数量を復元
      if (last.quantities || last.hourlyHours) {
        setImportData({
          quantities: last.quantities || {},
          hourlyHours: last.hourlyHours || 0,
        })
      }

      showToast('前回の入力内容を復元しました', 'success')
    } catch { /* ignore */ }
  }, [workers, showToast])

  const buttonText =
    submitState === 'submitting'
      ? '提出中...'
      : submitState === 'done'
        ? '提出しました'
        : '提出する'

  // 今日の提出状況
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter((r) => r.date === today)
  const todaySubmittedNames = [...new Set(todayRecords.map((r) => r.worker_name))]
  const todayTotal = todayRecords.reduce((sum, r) => sum + r.total, 0)
  const unsubmittedWorkers = workers.filter((w) => !todaySubmittedNames.includes(w.name))

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black">作業入力</h2>
        <p className="text-sm text-muted mt-0.5">作業内容を入力して提出します</p>
      </div>

      {/* 今日の提出状況 */}
      {todayRecords.length > 0 && (
        <div className="bg-green-light/40 border border-green/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-green" />
            <span className="text-sm font-bold text-ink">今日の提出状況</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="text-center">
              <div className="text-2xl font-black text-green font-mono">{todayRecords.length}</div>
              <div className="text-[10px] text-muted">件提出済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-mango-dark font-mono">¥{todayTotal.toLocaleString()}</div>
              <div className="text-[10px] text-muted">合計金額</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {todaySubmittedNames.map((name) => (
              <span key={name} className="text-[10px] bg-green/15 text-green px-2 py-0.5 rounded-full font-bold">
                {name}
              </span>
            ))}
            {unsubmittedWorkers.map((w) => (
              <span key={w.id} className="text-[10px] bg-cream text-muted px-2 py-0.5 rounded-full">
                {w.name}（未提出）
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Master Data Change Banner */}
      <AnimatePresence>
        {masterChanged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 bg-yellow-light border border-yellow/40 rounded-xl p-3">
              <AlertTriangle className="w-5 h-5 text-yellow flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">設定が変更されました</p>
                <p className="text-xs text-muted mt-0.5">
                  管理者が単価や作業者を変更しました。提出時に最新の単価で自動的に再計算されます。
                </p>
              </div>
              <button
                onClick={() => setMasterChanged(false)}
                className="text-xs text-muted hover:text-ink cursor-pointer flex-shrink-0"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 前回の入力を復元ボタン */}
      {hasLastSubmit && !selectedWorker && items.length === 0 && (
        <button
          onClick={handleLoadLastSubmit}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-mango/20 bg-mango-light/30 px-4 py-3 text-sm font-bold text-mango-dark hover:bg-mango-light/50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          前回と同じ内容で入力
        </button>
      )}

      {/* Live Drafts from other devices */}
      <LiveDrafts currentDeviceId={deviceId} onImportDraft={handleImportDraft} />

      {/* Worker Picker - 最初に選択 */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">作業者</label>
        <WorkerPicker
          workers={workers}
          selectedId={selectedWorker?.id ?? null}
          onSelect={handleWorkerSelect}
        />
      </div>

      {/* Work Date & Address - 作業者選択後に表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted">作業日</label>
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10"
          />
        </div>
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
      </div>

      {/* Process List */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted">加工内容</label>
        <div className="bg-white rounded-xl border border-border p-3">
          <ProcessList onItemsChange={handleItemsChange} resetSignal={resetSignal} importData={importData} />
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

      {/* Photos */}
      <div className="bg-white rounded-xl border border-border p-4">
        <PhotoAttach photos={photos} onChange={setPhotos} />
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
        disabled={submitState === 'done' || !selectedWorker}
        onClick={handleSubmit}
      >
        {!selectedWorker ? '作業者を選択してください' : buttonText}
      </Button>

      {/* 提出完了確認モーダル */}
      <AnimatePresence>
        {submittedSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={handleDismissSummary}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green" />
                </div>
                <h3 className="text-lg font-black text-ink">提出完了</h3>
              </div>

              <div className="bg-cream rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">作業者</span>
                  <span className="font-bold text-ink">{submittedSummary.workerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">作業日</span>
                  <span className="font-mono text-ink">{submittedSummary.date}</span>
                </div>
                <div className="border-t border-border my-1" />
                {submittedSummary.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-ink/70">
                    <span>{item.name}</span>
                    <span className="font-mono">
                      {item.qty} × ¥{item.price.toLocaleString()} = ¥{item.sub.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted">小計</span>
                  <span className="font-mono font-bold">¥{submittedSummary.baseTotal.toLocaleString()}</span>
                </div>
                {submittedSummary.bonusAmt > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">ボーナス</span>
                    <span className="font-mono font-bold text-green">+¥{submittedSummary.bonusAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black">
                  <span>合計</span>
                  <span className="text-mango-dark font-mono">¥{submittedSummary.total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleDismissSummary}
              >
                確認しました
              </Button>
              <button
                onClick={handleUndoSubmit}
                className="w-full text-center text-xs text-muted hover:text-red cursor-pointer py-2 transition-colors"
              >
                この提出を取り消す
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

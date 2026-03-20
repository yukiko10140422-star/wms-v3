import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RotateCcw, Eraser, Clock, Package } from 'lucide-react'
import { useStore } from '../store/useStore'
import ProcessList from '../components/work/ProcessList'
import BonusToggle from '../components/work/BonusToggle'
import Timer from '../components/work/Timer'
import type { TimerHandle } from '../components/work/Timer'
import TotalPanel from '../components/work/TotalPanel'
import Button from '../components/ui/Button'
import LiveDrafts from '../components/work/LiveDrafts'
import PhotoAttach from '../components/work/PhotoAttach'
import DailySummary from '../components/work/DailySummary'
import ConfirmSubmitModal from '../components/work/ConfirmSubmitModal'
import type { ConfirmSummary } from '../components/work/ConfirmSubmitModal'
import SubmittedModal from '../components/work/SubmittedModal'
import type { SubmittedSummary } from '../components/work/SubmittedModal'
import { enqueueRecord } from '../hooks/useOfflineQueue'
import { formatTimeLocal } from '../lib/timerUtils'
import { calcHourlyTotal } from '../lib/workCalc'
import { STORAGE_KEYS } from '../lib/storageKeys'
import {
  loadDraft,
  saveLocalDraft,
  clearAllDrafts,
  loadWorkerDefaults,
  saveWorkerDefaults,
  getDeviceId,
} from '../lib/storage'
import type { WorkMode } from '../lib/storage'
import type { WorkItem, TimerLogEntry, Draft } from '../lib/types'

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
  const loggedInWorker = useStore((s) => s.loggedInWorker)

  const draft = useRef(loadDraft()).current
  const [workDate, setWorkDate] = useState(() => draft?.workDate || new Date().toISOString().split('T')[0])
  const [address, setAddress] = useState(() => draft?.address || '')
  const [remarks, setRemarks] = useState(() => draft?.remarks || '')
  const [bonusOn, setBonusOn] = useState(() => draft?.bonusOn ?? false)
  const [bonusRate, setBonusRate] = useState(() => draft?.bonusRate ?? settings?.bonus_rate ?? 10)
  const [workMode, setWorkMode] = useState<WorkMode>('piece')
  const [hourlyHoursInput, setHourlyHoursInput] = useState(0)
  const [items, setItems] = useState<WorkItem[]>([])
  const [baseTotal, setBaseTotal] = useState(0)
  const [timerData, setTimerData] = useState<{
    hours: number
    timer_work_ms: number
    timer_log: TimerLogEntry[]
  } | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const timerRef = useRef<TimerHandle>(null)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [resetSignal, setResetSignal] = useState(0)
  const [importData, setImportData] = useState<{ quantities: Record<string, number>; hourlyHours: number } | null>(null)
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | null>(null)

  // 提出前確認用
  const [confirmSummary, setConfirmSummary] = useState<ConfirmSummary | null>(null)

  // マスタデータ変更検知用
  const [masterChanged, setMasterChanged] = useState(false)
  const prevProcessesRef = useRef<string>('')
  const prevWorkersRef = useRef<string>('')
  const hasInput = items.length > 0 || loggedInWorker !== null

  // 工程・作業者のマスタ変更を検知
  useEffect(() => {
    const processesKey = processes.map((p) => `${p.id}:${p.price}:${p.name}`).join(',')
    const workersKey = workers.map((w) => w.id).join(',')

    if (prevProcessesRef.current && prevProcessesRef.current !== processesKey && hasInput) {
      setMasterChanged(true)
    }
    if (prevWorkersRef.current && prevWorkersRef.current !== workersKey && hasInput) {
      setMasterChanged(true)
    }

    prevProcessesRef.current = processesKey
    prevWorkersRef.current = workersKey
  }, [processes, workers, hasInput])

  // ログイン中の作業者の住所・デフォルト設定を自動適用
  useEffect(() => {
    if (loggedInWorker) {
      if (!address && !draft?.address) {
        setAddress(loggedInWorker.address || '')
      }
      // 作業者ごとのデフォルト設定を適用（ドラフト復元がない場合のみ）
      if (!draft?.bonusOn && !draft?.bonusRate) {
        const defaults = loadWorkerDefaults(loggedInWorker.id)
        if (defaults) {
          setBonusOn(defaults.bonusOn)
          setBonusRate(defaults.bonusRate)
          if (defaults.workMode) setWorkMode(defaults.workMode)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInWorker])

  // フォーム変更時にlocalStorageへ保存
  useEffect(() => {
    saveLocalDraft({
      workerId: loggedInWorker?.id ?? null,
      workDate,
      address,
      remarks,
      bonusOn,
      bonusRate,
    })
  }, [loggedInWorker, workDate, address, remarks, bonusOn, bonusRate])

  // Supabase下書き同期（デバウンス2秒）
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      // 数量情報をlocalStorageから取得
      let quantities: Record<string, number> = {}
      let hourlyHours = 0
      try {
        const qRaw = localStorage.getItem(STORAGE_KEYS.QUANTITIES_DRAFT)
        if (qRaw) quantities = JSON.parse(qRaw)
        const hRaw = localStorage.getItem(STORAGE_KEYS.HOURLY_DRAFT)
        if (hRaw) hourlyHours = parseFloat(hRaw) || 0
      } catch { /* ignore */ }

      saveDraftToServer({
        id: deviceId,
        worker_id: loggedInWorker?.id ?? null,
        worker_name: loggedInWorker?.name ?? '',
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
  }, [loggedInWorker, workDate, address, remarks, bonusOn, bonusRate, baseTotal, items, saveDraftToServer])

  const handleItemsChange = useCallback((newItems: WorkItem[], newBaseTotal: number) => {
    setItems(newItems)
    setBaseTotal(newBaseTotal)
  }, [])

  // 他端末の下書きを取り込む
  const handleImportDraft = useCallback((importedDraft: Draft) => {
    const confirmed = confirm(
      `${importedDraft.worker_name || '（未選択）'}さんのデータを取り込みますか？\n現在の入力内容は上書きされます。`
    )
    if (!confirmed) return

    // フォームフィールド復元
    if (importedDraft.work_date) setWorkDate(importedDraft.work_date)
    if (importedDraft.remarks) setRemarks(importedDraft.remarks)
    setBonusOn(importedDraft.bonus_on)
    setBonusRate(importedDraft.bonus_rate)

    // 数量をProcessListに反映
    setImportData({
      quantities: importedDraft.quantities || {},
      hourlyHours: importedDraft.hourly_hours || 0,
    })

    showToast('データを取り込みました', 'success')
  }, [showToast])

  const handleTimerApply = useCallback(
    (result: { hours: number; timer_work_ms: number; timer_log: TimerLogEntry[] }) => {
      setTimerData(result)
      const logText = result.timer_log
        .map((e) => `[${formatTimeLocal(e.time)}] ${e.type}`)
        .join('\n')
      setRemarks((prev) => (prev ? `${prev}\n${logText}` : logText))
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

  const hourlyRate = settings?.hourly_rate ?? 1200
  const effectiveBaseTotal = workMode === 'hourly'
    ? calcHourlyTotal(hourlyHoursInput, hourlyRate)
    : baseTotal
  const bonusAmt = bonusOn ? Math.round(effectiveBaseTotal * (bonusRate / 100)) : 0
  const total = effectiveBaseTotal + bonusAmt

  // バリデーション → 確認モーダル表示
  const handlePreSubmit = () => {
    // 1. 作業者のログインチェック
    if (!loggedInWorker) {
      showToast('ログインしてください', 'error')
      return
    }

    // 2. 日付のチェック
    const workDateObj = new Date(workDate)
    const todayDate = new Date()
    todayDate.setHours(23, 59, 59, 999)
    if (workDateObj > todayDate) {
      showToast('未来の日付では提出できません', 'error')
      return
    }
    const daysSince = Math.floor((Date.now() - workDateObj.getTime()) / 86400000)
    if (daysSince > 30) {
      const confirmed = confirm(`${daysSince}日前の記録です。本当に提出しますか？`)
      if (!confirmed) return
    }

    // 3. 加工内容のチェック
    if (workMode === 'hourly') {
      if (hourlyHoursInput <= 0) {
        showToast('作業時間を入力してください', 'error')
        return
      }
    } else {
      if (items.length === 0) {
        showToast('加工内容を入力してください', 'error')
        return
      }
    }

    // 4. 同じ作業者・同じ日の重複チェック
    const duplicate = records.find(
      (r) => r.worker_name === loggedInWorker.name && r.date === workDate
    )
    if (duplicate) {
      const confirmed = confirm(
        `${loggedInWorker.name}さんの ${workDate} の記録はすでに存在します。\n重複して提出しますか？`
      )
      if (!confirmed) return
    }

    // 5. タイマーが動作中なら自動適用
    if (!timerData && timerRef.current?.hasData()) {
      const result = timerRef.current.apply()
      setTimerData(result)
      const logText = result.timer_log
        .map((e) => `[${formatTimeLocal(e.time)}] ${e.type}`)
        .join('\n')
      setRemarks((prev) => (prev ? `${prev}\n${logText}` : logText))
    }

    // 6. 最新単価で再計算してプレビュー表示
    if (workMode === 'hourly') {
      const hourlyTotal = calcHourlyTotal(hourlyHoursInput, hourlyRate)
      const previewBonusAmt = bonusOn ? Math.round(hourlyTotal * (bonusRate / 100)) : 0
      const hourlyItems: WorkItem[] = [{
        name: '時給作業',
        price: hourlyRate,
        qty: hourlyHoursInput,
        sub: hourlyTotal,
        isHourly: true,
      }]
      setConfirmSummary({
        workerName: loggedInWorker.name,
        date: workDate,
        address,
        items: hourlyItems,
        baseTotal: hourlyTotal,
        bonusAmt: previewBonusAmt,
        total: hourlyTotal + previewBonusAmt,
      })
    } else {
      const recalc = recalculateWithLatestPrices(items)
      const previewBonusAmt = bonusOn ? Math.round(recalc.baseTotal * (bonusRate / 100)) : 0
      setConfirmSummary({
        workerName: loggedInWorker.name,
        date: workDate,
        address,
        items: recalc.items,
        baseTotal: recalc.baseTotal,
        bonusAmt: previewBonusAmt,
        total: recalc.baseTotal + previewBonusAmt,
      })
    }
  }

  // 確認後の実際の提出処理
  const handleSubmit = async () => {
    if (!loggedInWorker || !confirmSummary) return
    setConfirmSummary(null)
    setSubmitState('submitting')

    try {
      let finalItems: WorkItem[]
      let finalBaseTotal: number

      if (workMode === 'hourly') {
        finalBaseTotal = calcHourlyTotal(hourlyHoursInput, hourlyRate)
        finalItems = [{
          name: '時給作業',
          price: hourlyRate,
          qty: hourlyHoursInput,
          sub: finalBaseTotal,
          isHourly: true,
        }]
      } else {
        const recalc = recalculateWithLatestPrices(items)
        finalBaseTotal = recalc.baseTotal
        finalItems = recalc.items
      }

      const finalBonusAmt = bonusOn ? Math.round(finalBaseTotal * (bonusRate / 100)) : 0
      const finalTotal = finalBaseTotal + finalBonusAmt

      const recordData = {
        date: workDate,
        worker_name: loggedInWorker.name,
        address,
        remarks,
        avatar: loggedInWorker.avatar || '',
        bonus_on: bonusOn,
        bonus_amt: finalBonusAmt,
        bonus_rate: bonusRate,
        items: finalItems,
        base_total: finalBaseTotal,
        total: finalTotal,
        hours: workMode === 'hourly' ? hourlyHoursInput : (timerData?.hours ?? 0),
        timer_log: timerData?.timer_log ?? [],
        timer_work_ms: timerData?.timer_work_ms ?? 0,
        photos: photos,
        status: 'pending' as const,
      }

      let recordId: number | null = null
      if (navigator.onLine) {
        recordId = await addRecord(recordData)
        if (!recordId) return
      } else {
        enqueueRecord(recordData)
        recordId = Date.now()
        showToast('オフラインで保存しました（接続時に自動送信します）', 'info')
      }

      setSubmitState('done')
      setMasterChanged(false)

      // 作業者ごとのデフォルト設定を保存
      saveWorkerDefaults(loggedInWorker.id, { bonusOn, bonusRate, workMode })

      try {
        localStorage.setItem(STORAGE_KEYS.LAST_SUBMIT, JSON.stringify({
          workerId: loggedInWorker.id,
          workerName: loggedInWorker.name,
          address,
          bonusOn,
          bonusRate,
          quantities: (() => {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.QUANTITIES_DRAFT)
              return raw ? JSON.parse(raw) : {}
            } catch { return {} }
          })(),
          hourlyHours: (() => {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.HOURLY_DRAFT)
              return raw ? parseFloat(raw) || 0 : 0
            } catch { return 0 }
          })(),
        }))
      } catch { /* ignore */ }

      setSubmittedSummary({
        recordId,
        workerName: loggedInWorker.name,
        date: workDate,
        items: finalItems,
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
    setWorkDate(new Date().toISOString().split('T')[0])
    setAddress(loggedInWorker?.address || '')
    setRemarks('')
    setBonusOn(false)
    setBonusRate(settings?.bonus_rate ?? 10)
    setItems([])
    setBaseTotal(0)
    setHourlyHoursInput(0)
    setTimerData(null)
    setPhotos([])
    setSubmitState('idle')
    setImportData(null)
    setMasterChanged(false)
    setResetSignal((s) => s + 1)
    clearAllDrafts()
    deleteDraftFromServer(deviceId)
  }, [deleteDraftFromServer, loggedInWorker, settings])

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
    try { return !!localStorage.getItem(STORAGE_KEYS.LAST_SUBMIT) } catch { return false }
  })()

  const handleLoadLastSubmit = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_SUBMIT)
      if (!raw) return
      const last = JSON.parse(raw)

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
  }, [showToast])

  const buttonText =
    submitState === 'submitting'
      ? '提出中...'
      : submitState === 'done'
        ? '提出しました'
        : '提出する'

  // 今日の提出状況
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter((r) => r.date === today)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black">作業入力</h2>
        <p className="text-sm text-muted mt-0.5">作業内容を入力して提出します</p>
      </div>

      {/* 今日の提出状況 */}
      <DailySummary todayRecords={todayRecords} workers={workers} />

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
      {hasLastSubmit && items.length === 0 && (
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

      {/* Work Date & Address */}
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

      {/* Work Mode Toggle */}
      <div className="bg-white rounded-xl border border-border p-1 flex">
        <button
          type="button"
          onClick={() => setWorkMode('piece')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            workMode === 'piece'
              ? 'bg-mango text-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Package className="w-4 h-4" />
          単価モード
        </button>
        <button
          type="button"
          onClick={() => setWorkMode('hourly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            workMode === 'hourly'
              ? 'bg-mango text-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          <Clock className="w-4 h-4" />
          時給モード
        </button>
      </div>

      {workMode === 'piece' ? (
        <>
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
          <Timer ref={timerRef} onApply={handleTimerApply} />
        </>
      ) : (
        <>
          {/* Hourly Mode Input */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-mango" />
              <span className="text-sm font-bold text-ink">時給作業</span>
              <span className="ml-auto text-xs text-muted font-mono">¥{hourlyRate.toLocaleString()}/h</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted">作業時間（時間）</label>
              <input
                type="number"
                step={0.5}
                min={0}
                value={hourlyHoursInput || ''}
                onChange={(e) => setHourlyHoursInput(parseFloat(e.target.value) || 0)}
                placeholder="例: 3.5"
                className="w-full rounded-xl border border-border px-4 py-3 text-lg font-mono text-center focus:border-mango focus:outline-none focus:ring-2 focus:ring-mango/10"
              />
            </div>

            {hourlyHoursInput > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm text-muted">{hourlyHoursInput}h × ¥{hourlyRate.toLocaleString()}</span>
                <span className="text-lg font-black text-mango-dark font-mono">
                  ¥{calcHourlyTotal(hourlyHoursInput, hourlyRate).toLocaleString()}
                </span>
              </div>
            )}

            {/* Timer in hourly mode */}
            <Timer ref={timerRef} onApply={(result) => {
              handleTimerApply(result)
              setHourlyHoursInput(result.hours)
            }} />
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
        </>
      )}

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
        items={workMode === 'hourly' && hourlyHoursInput > 0
          ? [{ name: '時給作業', price: hourlyRate, qty: hourlyHoursInput, sub: calcHourlyTotal(hourlyHoursInput, hourlyRate), isHourly: true }]
          : items}
        baseTotal={effectiveBaseTotal}
        bonusOn={bonusOn}
        bonusRate={bonusRate}
      />

      {/* Submit & Reset Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          loading={submitState === 'submitting'}
          disabled={submitState === 'done' || !loggedInWorker}
          onClick={handlePreSubmit}
        >
          {buttonText}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            if (items.length === 0 || confirm('入力内容をリセットしますか？')) {
              resetForm()
              showToast('入力内容をリセットしました', 'info')
            }
          }}
          disabled={submitState === 'submitting'}
        >
          <Eraser className="w-4 h-4" />
        </Button>
      </div>

      {/* 提出前確認モーダル */}
      <ConfirmSubmitModal
        summary={confirmSummary}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmSummary(null)}
      />

      {/* 提出完了確認モーダル */}
      <SubmittedModal
        summary={submittedSummary}
        onDismiss={handleDismissSummary}
        onUndo={handleUndoSubmit}
      />
    </div>
  )
}

import { useMemo } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import type { WorkRecord, Settings, Worker } from '../../lib/types'
import Button from '../ui/Button'

interface PaymentDocProps {
  records: WorkRecord[]
  settings: Settings
  workers: Worker[]
  title: string
  onClose: () => void
}

const PRINT_CSS = `
body{font-family:'Noto Serif JP',serif;margin:0;padding:18mm 16mm;color:#000;}
.dh{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7mm;padding-bottom:4mm;border-bottom:2.5px solid #ff8c00;}
.dt{font-size:21pt;font-weight:700;letter-spacing:4px;color:#e65c00;}.dn{font-size:7.5pt;color:#888;margin-top:2mm;font-family:'DM Mono',monospace;}
.di{text-align:right;}.dc2{font-size:12pt;font-weight:700;}.ds{font-size:7.5pt;color:#777;}
.dm{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:6mm;}
.mb{border:1px solid #f0d9b5;border-radius:3px;padding:2.5mm 3.5mm;background:#fff8f0;}
.ml{font-size:7pt;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:1mm;}.mv{font-size:10.5pt;font-weight:700;}
.dp{background:#ff8c00;color:#fff;padding:2mm 4mm;font-size:8.5pt;font-weight:700;letter-spacing:1px;margin-bottom:4.5mm;border-radius:2px;}
.dtb{width:100%;border-collapse:collapse;margin-bottom:4.5mm;}
.dtb th{background:#fff3e0;border:1px solid #f0d9b5;padding:1.8mm 2.5mm;font-size:7.5pt;text-align:center;font-weight:700;}
.dtb td{border:1px solid #f0d9b5;padding:2mm 2.5mm;font-size:8.5pt;vertical-align:middle;}
.dtb td.num{text-align:right;font-family:'DM Mono',monospace;}.dtb tr:nth-child(even) td{background:#fffde7;}
.dtb .dc{font-family:'DM Mono',monospace;font-size:7.5pt;color:#888;}.dtb .sub td{background:#fff3e0;font-weight:700;}
.cf::after{content:'';display:table;clear:both;}
.tot{float:right;width:65mm;border:1px solid #f0d9b5;border-radius:3px;overflow:hidden;margin-bottom:4.5mm;}
.tr2{display:flex;justify-content:space-between;padding:1.8mm 3.5mm;font-size:8.5pt;border-bottom:1px solid #f0d9b5;}
.tr2.g{background:#ff8c00;color:#fff;font-weight:700;font-size:10.5pt;border-bottom:none;}
.tmb{border:1px solid #ffe0b2;border-radius:3px;padding:2.5mm 3.5mm;margin-bottom:4mm;background:#fff8f0;}
.tml{font-size:7pt;color:#e65c00;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:1.5mm;}
.tmg{display:grid;grid-template-columns:1fr 1fr;gap:2mm;}.tms{font-size:7pt;color:#aaa;}
.tmv{font-size:10pt;font-weight:700;font-family:'DM Mono',monospace;color:#e65c00;}
.rem{clear:both;border:1px solid #f0d9b5;border-radius:3px;padding:2.5mm 3.5mm;margin-bottom:4.5mm;min-height:18mm;}
.reml{font-size:7pt;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:1.5mm;}.remt{font-size:8.5pt;white-space:pre-wrap;}
.bks{margin-bottom:4.5mm;}.bkg{display:grid;grid-template-columns:1fr 1fr;gap:3mm;}
.bkb{border:1px solid #f0d9b5;border-radius:3px;padding:2.5mm 3.5mm;}
.bkl{font-size:7pt;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:1.5mm;font-weight:700;}
.bkn{font-size:10pt;font-weight:700;margin-bottom:1mm;}.bkd{font-size:8pt;color:#555;line-height:1.7;font-family:'DM Mono',monospace;}
.sa{display:flex;justify-content:flex-end;gap:4.5mm;margin-top:4mm;}
.sb{text-align:center;width:20mm;}.sc{width:16mm;height:16mm;border:1px solid #ccc;border-radius:50%;margin:0 auto 1mm;}.sl{font-size:6.5pt;color:#aaa;}
.ft{text-align:center;font-size:6.5pt;color:#ccc;border-top:1px solid #f0d9b5;padding-top:2.5mm;margin-top:5mm;}
@media print{body{margin:0;padding:15mm 12mm;}@page{margin:0;size:A4;}}
`

export default function PaymentDoc({
  records,
  settings,
  workers,
  title,
  onClose,
}: PaymentDocProps) {
  const docHtml = useMemo(() => {
    if (!records.length) return '<p>対象の記録がありません</p>'

    const comp = settings.company || 'World Mango System'
    const mgr = settings.manager || ''
    const addr = settings.address || ''
    const wn = records[0].worker_name
    const wa = records[0].address || ''
    const wObj = workers.find((w) => w.name === wn)

    const tp = records.reduce((a, r) => a + r.total, 0)
    const tax = Math.round(tp * 0.1)
    const wt = tp + tax
    const month = records[0].date.slice(0, 7)
    const docNo = `${month.replace('-', '')}-${wn.replace(/\s/g, '')}`

    let twMs = 0
    let tbMs = 0
    records.forEach((r) => {
      if (r.timer_work_ms) twMs += r.timer_work_ms
      if (r.timer_log && r.timer_log.length) {
        let lp: string | null = null
        r.timer_log.forEach((l) => {
          if (l.type === '休憩') lp = l.time
          if ((l.type === '再開' || l.type === '終了') && lp) {
            const t1 = new Date(lp).getTime()
            const t2 = new Date(l.time).getTime()
            if (!isNaN(t1) && !isNaN(t2)) {
              tbMs += t2 - t1
            }
            lp = null
          }
        })
      }
    })
    const hasTimer = twMs > 0
    const twh = Math.floor(twMs / 3600000)
    const twm = Math.floor((twMs % 3600000) / 60000)
    const tbh = Math.floor(tbMs / 3600000)
    const tbm = Math.floor((tbMs % 3600000) / 60000)

    let rows = ''
    records.forEach((r) => {
      r.items.forEach((it, i) => {
        rows += `<tr><td class="dc">${i === 0 ? r.date : ''}</td><td>${it.name}</td><td class="num">&yen;${it.price.toLocaleString()}</td><td class="num">${it.isHourly ? it.qty + 'h' : it.qty + '個'}</td><td class="num">&yen;${it.sub.toLocaleString()}</td><td class="num">&yen;${Math.round(it.sub * 0.1).toLocaleString()}</td></tr>`
      })
      if (r.bonus_on) {
        rows += `<tr><td></td><td>+${r.bonus_rate || 10}%上乗せ</td><td></td><td></td><td class="num">&yen;${r.bonus_amt.toLocaleString()}</td><td class="num">&yen;${Math.round(r.bonus_amt * 0.1).toLocaleString()}</td></tr>`
      }
      rows += `<tr class="sub"><td class="dc">${r.date}</td><td colspan="3">日計</td><td class="num">&yen;${r.total.toLocaleString()}</td><td class="num">&yen;${Math.round(r.total * 0.1).toLocaleString()}</td></tr>`
    })

    const remarks = records
      .filter((r) => r.remarks)
      .map((r) => `[${r.date}] ${r.remarks}`)
      .join('\n')

    let html = `<div class="dh"><div><div class="dt">請 求 書</div><div class="dn">文書番号：${docNo}</div></div><div class="di"><div class="ml">支払元</div><div class="dc2">宮崎友祈子</div></div></div>`

    html += `<div class="dm"><div class="mb"><div class="ml">請求者</div><div class="mv">${wn}</div>${wa ? `<div style="font-size:8.5pt;color:#555;margin-top:1mm;">${wa}</div>` : ''}</div><div class="mb"><div class="ml">対象期間</div><div class="mv">${title}</div><div style="font-size:7.5pt;color:#555;margin-top:1mm;">作業件数：${records.length}件</div></div></div>`

    html += `<div class="dp">■ 加工作業明細</div>`
    html += `<table class="dtb"><thead><tr><th style="width:22mm;">作業日</th><th>加工の種類</th><th style="width:17mm;">単価</th><th style="width:17mm;">数量</th><th style="width:21mm;">金額（税抜）</th><th style="width:17mm;">消費税</th></tr></thead><tbody>${rows}</tbody></table>`

    html += `<div class="cf"><div class="tot"><div class="tr2"><span>税抜合計</span><span>&yen;${tp.toLocaleString()}</span></div><div class="tr2"><span>消費税（10%）</span><span>&yen;${tax.toLocaleString()}</span></div><div class="tr2 g"><span>税込合計</span><span>&yen;${wt.toLocaleString()}</span></div></div>`

    if (hasTimer) {
      html += `<div class="tmb"><div class="tml">作業時間記録</div><div class="tmg"><div><div class="tms">作業合計</div><div class="tmv">${twh}時間${String(twm).padStart(2, '0')}分</div></div><div><div class="tms">休憩合計</div><div class="tmv">${tbh}時間${String(tbm).padStart(2, '0')}分</div></div></div></div>`
    }

    html += `<div class="rem"><div class="reml">備考</div><div class="remt">${remarks || '\u3000'}</div></div></div>`

    // Bank info
    const hasBankInfo = wObj?.bank_name || settings.bank_name
    if (hasBankInfo) {
      html += `<div class="bks"><div class="bkg">`
      if (wObj?.bank_name) {
        html += `<div class="bkb"><div class="bkl">振込先（外注さん口座）</div><div class="bkn">${wObj.bank_name} ${wObj.bank_branch || ''}</div><div class="bkd">${wObj.bank_type || '普通'} ${wObj.bank_number || ''}<br>名義：${wObj.bank_holder || wn}</div></div>`
      } else {
        html += '<div></div>'
      }
      if (settings.bank_name) {
        html += `<div class="bkb"><div class="bkl">振込元（自社口座）</div><div class="bkn">${settings.bank_name} ${settings.bank_branch || ''}</div><div class="bkd">${settings.bank_type || '普通'} ${settings.bank_number || ''}<br>名義：${settings.bank_holder || comp}</div></div>`
      }
      html += `</div></div>`
    }

    // Stamp area
    html += `<div class="sa"><div class="sb"><div class="sc"></div><div class="sl">確認印</div></div><div class="sb"><div class="sc"></div><div class="sl">承認印</div></div></div>`

    // Footer
    html += `<div class="ft">本請求書は${new Date().toLocaleDateString('ja-JP')}に発行されました。 | 宮崎友祈子</div>`

    return html
  }, [records, settings, workers, title])

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return

    win.document.write(
      `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"><style>${PRINT_CSS}</style></head><body>${docHtml}</body></html>`
    )
    win.document.close()
    win.onload = () => {
      win.focus()
      win.print()
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Action bar — safe area対応 */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-center gap-3 z-10">
        <Button variant="secondary" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          印刷する
        </Button>
      </div>

      {/* Document preview */}
      <div className="max-w-[230mm] mx-auto p-8">
        <div dangerouslySetInnerHTML={{ __html: docHtml }} />
      </div>

      {/* Inline styles for preview rendering */}
      <style>{`
        .dh{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:2.5px solid #ff8c00;}
        .dt{font-size:28px;font-weight:700;letter-spacing:4px;color:#e65c00;font-family:serif;}
        .dn{font-size:10px;color:#888;margin-top:8px;font-family:monospace;}
        .di{text-align:right;}.dc2{font-size:16px;font-weight:700;}.ds{font-size:10px;color:#777;}
        .dm{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
        .mb{border:1px solid #f0d9b5;border-radius:6px;padding:10px 14px;background:#fff8f0;}
        .ml{font-size:9px;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}.mv{font-size:14px;font-weight:700;}
        .dp{background:#ff8c00;color:#fff;padding:8px 16px;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:18px;border-radius:4px;}
        .dtb{width:100%;border-collapse:collapse;margin-bottom:18px;}
        .dtb th{background:#fff3e0;border:1px solid #f0d9b5;padding:7px 10px;font-size:10px;text-align:center;font-weight:700;}
        .dtb td{border:1px solid #f0d9b5;padding:8px 10px;font-size:11px;vertical-align:middle;}
        .dtb td.num{text-align:right;font-family:monospace;}.dtb tr:nth-child(even) td{background:#fffde7;}
        .dtb .dc{font-family:monospace;font-size:10px;color:#888;}.dtb .sub td{background:#fff3e0;font-weight:700;}
        .cf::after{content:'';display:table;clear:both;}
        .tot{float:right;width:260px;border:1px solid #f0d9b5;border-radius:6px;overflow:hidden;margin-bottom:18px;}
        .tr2{display:flex;justify-content:space-between;padding:7px 14px;font-size:11px;border-bottom:1px solid #f0d9b5;}
        .tr2.g{background:#ff8c00;color:#fff;font-weight:700;font-size:14px;border-bottom:none;}
        .tmb{border:1px solid #ffe0b2;border-radius:6px;padding:10px 14px;margin-bottom:16px;background:#fff8f0;}
        .tml{font-size:9px;color:#e65c00;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;}
        .tmg{display:grid;grid-template-columns:1fr 1fr;gap:8px;}.tms{font-size:9px;color:#aaa;}
        .tmv{font-size:13px;font-weight:700;font-family:monospace;color:#e65c00;}
        .rem{clear:both;border:1px solid #f0d9b5;border-radius:6px;padding:10px 14px;margin-bottom:18px;min-height:72px;}
        .reml{font-size:9px;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;}.remt{font-size:11px;white-space:pre-wrap;}
        .bks{margin-bottom:18px;}.bkg{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .bkb{border:1px solid #f0d9b5;border-radius:6px;padding:10px 14px;}
        .bkl{font-size:9px;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;font-weight:700;}
        .bkn{font-size:13px;font-weight:700;margin-bottom:4px;}.bkd{font-size:11px;color:#555;line-height:1.7;font-family:monospace;}
        .sa{display:flex;justify-content:flex-end;gap:18px;margin-top:16px;}
        .sb{text-align:center;width:80px;}.sc{width:64px;height:64px;border:1px solid #ccc;border-radius:50%;margin:0 auto 4px;}.sl{font-size:9px;color:#aaa;}
        .ft{text-align:center;font-size:9px;color:#ccc;border-top:1px solid #f0d9b5;padding-top:10px;margin-top:20px;}
      `}</style>
    </div>
  )
}

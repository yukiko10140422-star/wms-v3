import { useState } from 'react'
import type { Settings } from '../../lib/types'
import Button from '../ui/Button'

interface CompanyFormProps {
  settings: Settings
  onSave: (data: Partial<Settings>) => Promise<void>
}

export default function CompanyForm({ settings, onSave }: CompanyFormProps) {
  const [company, setCompany] = useState(settings.company || '')
  const [manager, setManager] = useState(settings.manager || '')
  const [address, setAddress] = useState(settings.address || '')
  const [bankName, setBankName] = useState(settings.bank_name || '')
  const [bankBranch, setBankBranch] = useState(settings.bank_branch || '')
  const [bankType, setBankType] = useState(settings.bank_type || '普通')
  const [bankNumber, setBankNumber] = useState(settings.bank_number || '')
  const [bankHolder, setBankHolder] = useState(settings.bank_holder || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onSave({
      company: company.trim(),
      manager: manager.trim(),
      address: address.trim(),
      bank_name: bankName.trim(),
      bank_branch: bankBranch.trim(),
      bank_type: bankType,
      bank_number: bankNumber.trim(),
      bank_holder: bankHolder.trim(),
    })
    setLoading(false)
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        会社情報
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">会社名・屋号</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">担当者名</label>
          <input
            type="text"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="例：田中 太郎"
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <label className="text-xs font-bold text-muted">住所</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="例：東京都渋谷区..."
          className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
        />
      </div>

      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        振込元口座
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">銀行名</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="〇〇銀行"
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">支店名</label>
          <input
            type="text"
            value={bankBranch}
            onChange={(e) => setBankBranch(e.target.value)}
            placeholder="〇〇支店"
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">口座種別</label>
          <select
            value={bankType}
            onChange={(e) => setBankType(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
          >
            <option value="普通">普通</option>
            <option value="当座">当座</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">口座番号</label>
          <input
            type="text"
            value={bankNumber}
            onChange={(e) => setBankNumber(e.target.value)}
            placeholder="1234567"
            className="px-3 py-2 border border-border rounded-lg text-sm font-mono focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-muted">口座名義（カナ）</label>
          <input
            type="text"
            value={bankHolder}
            onChange={(e) => setBankHolder(e.target.value)}
            placeholder="グローバルマンゴー"
            className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango focus:ring-2 focus:ring-mango/10 outline-none"
          />
        </div>
      </div>

      <Button variant="primary" loading={loading} onClick={handleSave}>
        設定を保存
      </Button>
    </div>
  )
}

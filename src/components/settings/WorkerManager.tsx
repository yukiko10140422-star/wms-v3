import { useState, useRef } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Worker } from '../../lib/types'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface WorkerManagerProps {
  workers: Worker[]
  onAdd: (worker: Omit<Worker, 'id'>) => Promise<void>
  onUpdate: (id: string, data: Partial<Worker>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function compressImage(file: File, maxKB = 60): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        const max = 200
        if (w > max || h > max) {
          if (w > h) {
            h = Math.round((h * max) / w)
            w = max
          } else {
            w = Math.round((w * max) / h)
            h = max
          }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        let q = 0.8
        let result = canvas.toDataURL('image/jpeg', q)
        while (result.length > maxKB * 1024 * 1.37 && q > 0.2) {
          q -= 0.1
          result = canvas.toDataURL('image/jpeg', q)
        }
        resolve(result)
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function WorkerManager({
  workers,
  onAdd,
  onUpdate,
  onDelete,
}: WorkerManagerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankType, setBankType] = useState('普通')
  const [bankNumber, setBankNumber] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const openAdd = () => {
    setEditingId(null)
    setName('')
    setAddress('')
    setAvatar('')
    setBankName('')
    setBankBranch('')
    setBankType('普通')
    setBankNumber('')
    setBankHolder('')
    setModalOpen(true)
  }

  const openEdit = (w: Worker) => {
    setEditingId(w.id)
    setName(w.name)
    setAddress(w.address || '')
    setAvatar(w.avatar || '')
    setBankName(w.bank_name || '')
    setBankBranch(w.bank_branch || '')
    setBankType(w.bank_type || '普通')
    setBankNumber(w.bank_number || '')
    setBankHolder(w.bank_holder || '')
    setModalOpen(true)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setAvatar(compressed)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    setSaving(true)
    const base = {
      name: name.trim(),
      address: address.trim(),
      avatar,
      bank_name: bankName.trim(),
      bank_branch: bankBranch.trim(),
      bank_type: bankType,
      bank_number: bankNumber.trim(),
      bank_holder: bankHolder.trim(),
    }

    if (editingId) {
      // 編集時はPINを変更しない（既存PINを保持）
      await onUpdate(editingId, base)
    } else {
      // 新規追加時はPIN未設定
      await onAdd({ ...base, pin: null })
    }
    setSaving(false)
    setModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await onDelete(id)
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        外注さん管理
      </div>

      {workers.length === 0 ? (
        <div className="text-muted text-sm mb-4">まだ登録されていません</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {workers.map((w) => (
            <div
              key={w.id}
              className="bg-mango-light rounded-xl border border-border p-4 flex flex-col items-center text-center relative"
            >
              <button
                type="button"
                onClick={() => handleDelete(w.id)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red/10 text-red flex items-center justify-center hover:bg-red hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {w.avatar ? (
                <img
                  src={w.avatar}
                  alt={w.name}
                  className="w-[50px] h-[50px] rounded-full object-cover mb-2"
                />
              ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-yellow to-mango flex items-center justify-center text-lg font-black text-white mb-2">
                  {(w.name || '?').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="font-bold text-sm">{w.name}</div>
              {w.address && (
                <div className="text-xs text-muted">{w.address}</div>
              )}
              {w.bank_name ? (
                <div className="text-[10px] text-mango mt-1">
                  {w.bank_name}
                </div>
              ) : (
                <div className="text-[10px] text-muted/50 mt-1">口座未登録</div>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => openEdit(w)}
              >
                <Pencil className="w-3 h-3" />
                編集
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="success" onClick={openAdd}>
        <Plus className="w-4 h-4" />
        新しい外注さんを追加
      </Button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '外注さんを編集' : '外注さんを追加'}
      >
        <div className="flex items-center gap-4 mb-4">
          <label className="relative cursor-pointer">
            <div
              className={`w-[50px] h-[50px] rounded-full border-2 border-dashed flex items-center justify-center text-xl text-muted bg-bg ${
                avatar ? 'border-mango border-solid' : 'border-border-dark'
              }`}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '+'
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>

          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-muted">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 花子"
                className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-muted">住所</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="東京都..."
                className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] font-bold tracking-widest text-mango uppercase mb-3">
          振込先口座（任意）
        </div>

        <div className="bg-yellow-light border border-yellow rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted">銀行名</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="〇〇銀行"
                className="px-2 py-1.5 border border-border rounded-lg text-sm focus:border-mango outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted">支店名</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="〇〇支店"
                className="px-2 py-1.5 border border-border rounded-lg text-sm focus:border-mango outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted">口座種別</label>
              <select
                value={bankType}
                onChange={(e) => setBankType(e.target.value)}
                className="px-2 py-1.5 border border-border rounded-lg text-sm focus:border-mango outline-none"
              >
                <option value="普通">普通</option>
                <option value="当座">当座</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted">口座番号</label>
              <input
                type="text"
                value={bankNumber}
                onChange={(e) => setBankNumber(e.target.value)}
                placeholder="1234567"
                className="px-2 py-1.5 border border-border rounded-lg text-sm font-mono focus:border-mango outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted">口座名義（カナ）</label>
            <input
              type="text"
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              placeholder="ヤマダ ハナコ"
              className="px-2 py-1.5 border border-border rounded-lg text-sm focus:border-mango outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            キャンセル
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            保存する
          </Button>
        </div>
      </Modal>
    </div>
  )
}

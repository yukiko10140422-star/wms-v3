import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import type { Process } from '../../lib/types'
import Button from '../ui/Button'

interface PriceManagerProps {
  processes: Process[]
  onUpdate: (id: string, data: Partial<Process>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (process: Omit<Process, 'id' | 'sort_order'>) => Promise<void>
}

export default function PriceManager({
  processes,
  onUpdate,
  onDelete,
  onAdd,
}: PriceManagerProps) {
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    processes.forEach((p) => {
      map[p.id] = p.price
    })
    return map
  })
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePriceChange = (id: string, value: number) => {
    setPrices((prev) => ({ ...prev, [id]: value }))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await onDelete(id)
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      alert('名前を入力してください')
      return
    }
    const price = parseInt(newPrice)
    if (!price || price < 1) {
      alert('単価を入力してください')
      return
    }
    await onAdd({ name: newName.trim(), price })
    setNewName('')
    setNewPrice('')
  }

  const handleBulkSave = async () => {
    setSaving(true)
    const updates = processes.map((p) => {
      const newVal = prices[p.id]
      if (newVal !== undefined && newVal !== p.price) {
        return onUpdate(p.id, { price: newVal })
      }
      return Promise.resolve()
    })
    await Promise.all(updates)
    setSaving(false)
  }

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-mango-dark uppercase mb-4 pb-3 border-b border-mango-light">
        単価設定
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {processes.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 py-2 px-1 border-b border-border"
          >
            <span className="flex-1 text-sm">{p.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">&yen;</span>
              <input
                type="number"
                value={prices[p.id] ?? p.price}
                onChange={(e) =>
                  handlePriceChange(p.id, parseInt(e.target.value) || 0)
                }
                min={1}
                className="w-20 px-2 py-1.5 border border-border rounded-lg text-sm text-right font-mono focus:border-mango outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleDelete(p.id, p.name)}
              className="p-1 rounded hover:bg-red-light transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <div className="text-[10px] font-bold text-muted tracking-widest uppercase mb-3">
          新しいオプションを追加
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted">オプション名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例：ラベル貼り"
              className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted">単価（円）</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              min={1}
              placeholder="30"
              className="px-3 py-2 border border-border rounded-lg text-sm focus:border-mango outline-none"
            />
          </div>
        </div>
        <Button variant="success" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          追加
        </Button>
      </div>

      <Button variant="primary" loading={saving} onClick={handleBulkSave}>
        単価を保存
      </Button>
    </div>
  )
}

import type { WorkRecord } from '../../lib/types'
import RecordCard from './RecordCard'

interface RecordListProps {
  records: WorkRecord[]
  adminUnlocked: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onDelete: (id: number) => void
  onPrint: (id: number) => void
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
}

export default function RecordList({
  records,
  adminUnlocked,
  onApprove,
  onReject,
  onDelete,
  onPrint,
  selectedIds,
  onToggleSelect,
}: RecordListProps) {
  if (!records.length) {
    return (
      <div className="text-muted text-sm py-4">
        記録がありません
      </div>
    )
  }

  return (
    <div>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          adminUnlocked={adminUnlocked}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onPrint={onPrint}
          selected={selectedIds?.has(record.id) ?? false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}

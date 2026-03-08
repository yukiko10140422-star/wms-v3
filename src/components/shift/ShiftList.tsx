import type { Shift } from '../../lib/types'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Trash2 } from 'lucide-react'

interface ShiftListProps {
  shifts: Shift[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onDelete: (id: number) => void
}

export default function ShiftList({ shifts, onApprove, onReject, onDelete }: ShiftListProps) {
  if (!shifts.length) {
    return (
      <div className="text-muted text-sm py-4">
        シフト希望はまだありません
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {shifts.map((shift) => {
        const dateLabels = shift.dates
          .map((d) => {
            const [, m, day] = d.split('-')
            return `${parseInt(m)}/${parseInt(day)}`
          })
          .join(' / ')

        return (
          <div
            key={shift.id}
            className={`
              bg-white rounded-xl border p-4
              ${shift.status === 'approved' ? 'border-green/40' : shift.status === 'rejected' ? 'border-red/40 opacity-60' : 'border-border'}
            `}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{shift.worker_name}</span>
                  <Badge status={shift.status} />
                </div>
                <div className="text-xs text-muted mt-1">{dateLabels}</div>
                <div className="text-xs text-muted mt-0.5">
                  提出：{shift.submitted_at}
                </div>
              </div>
              <div className="flex gap-2">
                {shift.status !== 'approved' && (
                  <Button variant="success" size="sm" onClick={() => onApprove(shift.id)}>
                    承認
                  </Button>
                )}
                {shift.status !== 'rejected' && (
                  <Button variant="danger" size="sm" onClick={() => onReject(shift.id)}>
                    却下
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onDelete(shift.id)}>
                  <Trash2 className="w-4 h-4 text-red" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

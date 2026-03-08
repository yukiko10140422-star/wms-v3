type BadgeStatus = 'pending' | 'approved' | 'rejected'

interface BadgeProps {
  status: BadgeStatus
}

const config: Record<BadgeStatus, { className: string; label: string }> = {
  pending: {
    className: 'bg-yellow-light text-yellow-700 border border-yellow/30',
    label: '未確認',
  },
  approved: {
    className: 'bg-green-light text-green border border-green/30',
    label: '承認済み',
  },
  rejected: {
    className: 'bg-red-light text-red border border-red/30',
    label: '却下',
  },
}

export default function Badge({ status }: BadgeProps) {
  const { className, label } = config[status]

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  )
}

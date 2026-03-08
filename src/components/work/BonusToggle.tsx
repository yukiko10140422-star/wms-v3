interface BonusToggleProps {
  enabled: boolean
  rate: number
  onToggle: () => void
  onRateChange: (rate: number) => void
}

export default function BonusToggle({
  enabled,
  rate,
  onToggle,
  onRateChange,
}: BonusToggleProps) {
  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onClick={onToggle}
    >
      {/* Toggle Switch */}
      <div
        className={`
          w-11 h-6 rounded-full relative transition-all duration-200
          ${enabled ? 'bg-mango' : 'bg-gray-200'}
        `}
      >
        <div
          className={`
            w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5
            transition-all duration-200
            ${enabled ? 'left-5.5' : 'left-0.5'}
          `}
        />
      </div>

      {/* Label */}
      <span className="text-sm font-medium">
        ＋{rate}% 上乗せ
      </span>

      {/* Rate Input (when enabled) */}
      {enabled && (
        <input
          type="number"
          min={1}
          max={100}
          value={rate}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onRateChange(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          className="w-16 text-center rounded-lg border border-border px-2 py-1 text-sm font-mono focus:border-mango focus:outline-none"
        />
      )}
    </div>
  )
}

import type { Worker } from '../../lib/types'

interface WorkerPickerProps {
  workers: Worker[]
  selectedId: string | null
  onSelect: (worker: Worker) => void
}

export default function WorkerPicker({ workers, selectedId, onSelect }: WorkerPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {workers.map((worker) => {
        const isSelected = worker.id === selectedId
        const initial = worker.name.charAt(0)

        return (
          <button
            key={worker.id}
            type="button"
            onClick={() => onSelect(worker)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full
              transition-all duration-150 cursor-pointer
              ${
                isSelected
                  ? 'ring-2 ring-mango bg-mango-light'
                  : 'bg-white border border-border hover:border-mango'
              }
            `}
          >
            {worker.avatar ? (
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-mango-light text-mango-dark flex items-center justify-center text-sm font-bold">
                {initial}
              </div>
            )}
            <span className="text-sm font-medium">{worker.name}</span>
          </button>
        )
      })}
    </div>
  )
}

import { useState, useRef } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'

interface PhotoAttachProps {
  photos: string[]
  onChange: (photos: string[]) => void
  max?: number
}

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = (h * maxWidth) / w
          w = maxWidth
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PhotoAttach({ photos, onChange, max = 3 }: PhotoAttachProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    try {
      const newPhotos = [...photos]
      for (let i = 0; i < files.length && newPhotos.length < max; i++) {
        if (!allowedTypes.includes(files[i].type)) continue
        const compressed = await compressImage(files[i])
        newPhotos.push(compressed)
      }
      onChange(newPhotos)
    } catch {
      // ignore
    }
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-muted">写真（最大{max}枚）</label>

      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
            <img src={photo} alt={`写真${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-mango flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-mango border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-muted" />
                <span className="text-[10px] text-muted">追加</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {photos.length === 0 && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-xs text-muted hover:text-mango-dark cursor-pointer transition-colors"
        >
          <Camera className="w-4 h-4" />
          カメラで撮影または画像を選択
        </button>
      )}
    </div>
  )
}

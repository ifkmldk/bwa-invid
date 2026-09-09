"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"

export function GalleryStep() {
  const { data, updateData } = useWizard()
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [hint, setHint] = useState<string | null>(null)

  function addPhoto() {
    const trimmed = url.trim()
    if (!trimmed) {
      setHint("Isi dulu URL fotonya")
      return
    }
    if (!/^https?:\/\/.+\..+/.test(trimmed)) {
      setHint("URL harus diawali http:// atau https://")
      return
    }
    setHint(null)
    updateData({ gallery: [...data.gallery, { url: trimmed, caption: caption.trim() }] })
    setUrl("")
    setCaption("")
  }

  function removePhoto(index: number) {
    updateData({ gallery: data.gallery.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Galeri Foto</h3>
        <p className="text-sm text-ink-soft">Tambahkan foto kenangan bersama pasangan lewat URL gambar</p>
      </div>

      {data.gallery.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {data.gallery.map((photo, i) => (
            <li
              key={i}
              data-testid="gallery-item"
              className="relative rounded-xl overflow-hidden border border-line bg-blush/10"
            >
              <img src={photo.url} alt={photo.caption || `Foto ${i + 1}`} className="w-full h-32 object-cover" />
              {photo.caption && (
                <p className="px-2 py-1.5 text-xs text-ink-soft truncate">{photo.caption}</p>
              )}
              <button
                onClick={() => removePhoto(i)}
                data-testid="gallery-remove"
                aria-label={`Hapus foto ${i + 1}`}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-maroon text-sm font-bold shadow-sm hover:bg-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border border-line rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            URL Foto <span className="text-maroon">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://contoh.com/foto-kami.jpg"
            data-testid="gallery-url"
            className="w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Keterangan (opsional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Contoh: Foto pre-wedding di pantai"
            data-testid="gallery-caption"
            className="w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"
          />
        </div>
        {hint && (
          <p data-testid="gallery-hint" role="alert" className="text-sm text-maroon">
            {hint}
          </p>
        )}
        <button
          onClick={addPhoto}
          data-testid="gallery-add"
          className="px-4 py-2.5 text-sm font-semibold text-maroon bg-blush/20 hover:bg-blush/30 rounded-xl transition-colors"
        >
          + Tambah Foto
        </button>
      </div>
    </div>
  )
}
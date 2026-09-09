"use client"

export function GalleryStep() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Galeri Foto</h3>
        <p className="text-sm text-ink-soft">Upload foto-foto kenangan bersama pasangan</p>
      </div>

      <div className="border-2 border-dashed border-line rounded-xl p-10 text-center">
        <svg className="w-12 h-12 mx-auto text-ink-soft/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-sm text-ink-soft mb-1">Drag &amp; drop foto ke sini</p>
        <p className="text-xs text-ink-soft/60">atau klik untuk memilih file</p>
        <p className="text-xs text-ink-soft/60 mt-3">Fitur upload foto akan tersedia di update berikutnya</p>
      </div>
    </div>
  )
}

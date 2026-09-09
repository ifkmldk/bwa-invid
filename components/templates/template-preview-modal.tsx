"use client"

interface TemplatePreviewModalProps {
  template: {
    id: string
    name: string
    slug: string
    tier: string
    themeConfig: any
    category: { name: string }
  }
  onClose: () => void
  onUse: (templateId: string) => void
}

export function TemplatePreviewModal({ template, onClose, onUse }: TemplatePreviewModalProps) {
  const theme = typeof template.themeConfig === "string"
    ? JSON.parse(template.themeConfig)
    : template.themeConfig

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={template.name}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_8px_48px_rgba(46,42,38,0.2)] max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col border border-line">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="font-display text-xl tracking-tight text-ink">{template.name}</h2>
            <p className="text-sm text-ink-soft">{template.category.name} &middot; {template.tier === "free" ? "Gratis" : template.tier}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blush/15 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div
            className="rounded-xl overflow-hidden border border-line"
            style={{ backgroundColor: theme.backgroundColor || "#ffffff" }}
          >
            <div
              className="p-8 text-center"
              style={{ backgroundColor: theme.primaryColor || "#8AA69B" }}
            >
              <div
                className="w-20 h-20 mx-auto rounded-full mb-4"
                style={{ backgroundColor: theme.secondaryColor || "#E8C4B8", border: "4px solid rgba(255,255,255,0.3)" }}
              />
              <h3
                className="text-2xl mb-1"
                style={{ color: "#ffffff", fontFamily: theme.fontFamily || "var(--font-display)" }}
              >
                Rina &amp; Andi
              </h3>
              <p className="text-white/70 text-sm">14 Februari 2026</p>
            </div>

            <div className="p-6 space-y-4" style={{ color: theme.textColor || "#2E2A26" }}>
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2">Akad Nikah</h4>
                <p className="text-sm opacity-70">Sabtu, 14 Februari 2026 &middot; 08:00 - 10:00</p>
                <p className="text-sm opacity-70">Masjid Istiqlal, Jakarta</p>
              </div>
              <div className="border-t" style={{ borderColor: theme.accentColor || "#E5DDD2" }} />
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2">Resepsi</h4>
                <p className="text-sm opacity-70">Sabtu, 14 Februari 2026 &middot; 11:00 - 14:00</p>
                <p className="text-sm opacity-70">Gedung Serbaguna, Jakarta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-line flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-blush/15 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onUse(template.id)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon hover:bg-maroon-deep rounded-xl transition-colors shadow-sm"
          >
            Gunakan Template Ini
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TemplateCard } from "@/components/templates/template-card"
import { TemplatePreviewModal } from "@/components/templates/template-preview-modal"
import { CategoryTabs } from "@/components/templates/category-tabs"

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    const res = await fetch("/api/templates")
    const data = await res.json()
    setTemplates(data.templates || [])
    setLoading(false)
  }

  const filtered = selectedCategory === "Semua"
    ? templates
    : templates.filter((t) => t.category.name === selectedCategory)

  async function handleUseTemplate(templateId: string) {
    setCreating(true)
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json()
      if (data.invitation) {
        router.push(`/dashboard/invitations/${data.invitation.id}`)
      }
    } catch {
      alert("Gagal membuat undangan")
    }
    setCreating(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-tight text-ink">Pilih Template</h1>
        <p className="text-sm text-ink-soft mt-1">Temukan template yang cocok untuk undanganmu</p>
      </div>

      <div className="mb-6">
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-soft">Memuat template...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-ink-soft">Tidak ada template di kategori ini</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={setPreviewTemplate}
            />
          ))}
        </div>
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUseTemplate}
        />
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="animate-spin w-8 h-8 border-4 border-maroon border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-ink-soft">Membuat undangan...</p>
          </div>
        </div>
      )}
    </div>
  )
}

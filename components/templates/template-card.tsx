"use client"

interface TemplateCardProps {
  template: {
    id: string
    name: string
    slug: string
    tier: string
    themeConfig: any
    category: { name: string }
  }
  onClick: (template: any) => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const theme = typeof template.themeConfig === "string"
    ? JSON.parse(template.themeConfig)
    : template.themeConfig

  return (
    <button
      onClick={() => onClick(template)}
      className="group text-left bg-white rounded-xl border border-line overflow-hidden hover:shadow-[0_2px_24px_rgba(46,42,38,0.08)] hover:border-blush transition-all"
    >
      <div
        className="h-40 relative"
        style={{ backgroundColor: theme.primaryColor || "#8AA69B" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto rounded-full mb-3"
              style={{ backgroundColor: theme.secondaryColor || "#E8C4B8" }}
            />
            <div className="h-2 w-20 mx-auto rounded" style={{ backgroundColor: "rgba(255,255,255,0.35)" }} />
            <div className="h-2 w-12 mx-auto rounded mt-1.5" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${template.tier === "free" ? "bg-white/20 text-white" : "bg-white/90 text-ink"}`}
          >
            {template.tier === "free" ? "Gratis" : template.tier}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-ink group-hover:text-maroon transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-ink-soft mt-1">{template.category.name}</p>
      </div>
    </button>
  )
}

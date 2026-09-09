"use client"

const categories = ["Semua", "Modern", "Traditional", "Minimalist", "Luxury", "Islamic"]

interface CategoryTabsProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selected === cat
              ? "bg-maroon text-white"
              : "bg-white text-ink-soft border border-line hover:border-blush hover:text-maroon"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

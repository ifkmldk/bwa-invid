"use client"

import { useWizard } from "./wizard-context"

const steps = [
  { label: "Data Pasangan", icon: "couple" },
  { label: "Detail Acara", icon: "event" },
  { label: "Galeri", icon: "gallery" },
  { label: "Cerita Cinta", icon: "story" },
  { label: "Hadiah", icon: "gift" },
  { label: "Pengaturan", icon: "settings" },
]

export function WizardNav() {
  const { currentStep, setCurrentStep, data } = useWizard()

  function isCompleted(index: number): boolean {
    switch (index) {
      case 0: return !!(data.groomName && data.brideName)
      case 1: return data.events.length > 0 && data.events.some((e) => e.title && e.date)
      case 2: return false
      case 3: return data.loveStory.length > 0
      case 4: return data.gifts.length > 0
      case 5: return false
      default: return false
    }
  }

  return (
    <nav className="space-y-1">
      {steps.map((step, index) => {
        const active = currentStep === index
        const completed = isCompleted(index)
        return (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
              ${active
                ? "bg-blush/25 text-maroon"
                : completed
                  ? "text-sage hover:bg-blush/10"
                  : "text-ink-soft hover:bg-blush/10 hover:text-ink"
              }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${active
                  ? "bg-maroon text-white"
                  : completed
                    ? "bg-sage/20 text-sage"
                    : "bg-blush/15 text-ink-soft"
                }`}
            >
              {completed && !active ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span className="hidden lg:block">{step.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

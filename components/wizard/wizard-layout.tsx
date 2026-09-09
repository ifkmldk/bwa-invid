"use client"

import { useWizard } from "./wizard-context"
import { WizardNav } from "./wizard-nav"
import { WizardPreview } from "./wizard-preview"
import { CoupleStep } from "./steps/couple-step"
import { EventsStep } from "./steps/events-step"
import { GalleryStep } from "./steps/gallery-step"
import { LoveStoryStep } from "./steps/love-story-step"
import { GiftsStep } from "./steps/gifts-step"
import { SettingsStep } from "./steps/settings-step"
import Link from "next/link"

const stepComponents = [CoupleStep, EventsStep, GalleryStep, LoveStoryStep, GiftsStep, SettingsStep]

export function WizardLayout() {
  const { currentStep, setCurrentStep, saveStatus, invitationId, templateName } = useWizard()

  const StepComponent = stepComponents[currentStep]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          href="/dashboard"
          className="text-sm text-ink-soft hover:text-ink transition-colors"
        >
          Undangan Saya
        </Link>
        <span className="text-ink-soft/40">/</span>
        <span className="text-sm text-ink font-medium">{templateName}</span>
        <span className="ml-auto text-xs text-ink-soft/70">
          {saveStatus === "saving" && "Menyimpan..."}
          {saveStatus === "saved" && "Tersimpan"}
          {saveStatus === "error" && <span className="text-maroon">Gagal menyimpan</span>}
        </span>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-48 flex-shrink-0">
          <WizardNav />
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-line p-6 mb-6 shadow-[0_2px_24px_rgba(46,42,38,0.04)]">
            <StepComponent />

            <div className="flex justify-between mt-8 pt-5 border-t border-line">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-blush/15 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon hover:bg-maroon-deep rounded-xl transition-colors shadow-sm"
                >
                  Selanjutnya
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-sage hover:bg-sage/90 rounded-xl transition-colors shadow-sm inline-flex items-center"
                >
                  Simpan &amp; Kembali
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <WizardPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

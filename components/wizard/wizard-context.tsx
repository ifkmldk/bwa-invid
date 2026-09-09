"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

interface WizardData {
  groomName: string
  brideName: string
  groomFather: string
  groomMother: string
  brideFather: string
  brideMother: string
  coverImageUrl: string
  events: Array<{
    title: string
    date: string
    timeStart: string
    timeEnd: string
    location: string
    address: string
    mapsUrl: string
  }>
  loveStory: Array<{
    date: string
    description: string
  }>
  gifts: Array<{
    bankName: string
    accountNumber: string
    accountName: string
  }>
}

interface WizardContextType {
  data: WizardData
  updateData: (partial: Partial<WizardData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  saveStatus: "idle" | "saving" | "saved" | "error"
  invitationId: string
  themeConfig: any
  templateName: string
}

const WizardContext = createContext<WizardContextType | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}

const defaultData: WizardData = {
  groomName: "",
  brideName: "",
  groomFather: "",
  groomMother: "",
  brideFather: "",
  brideMother: "",
  coverImageUrl: "",
  events: [{ title: "Akad Nikah", date: "", timeStart: "", timeEnd: "", location: "", address: "", mapsUrl: "" }],
  loveStory: [],
  gifts: [],
}

export function WizardProvider({
  children,
  invitationId,
  initialData,
  themeConfig,
  templateName,
}: {
  children: React.ReactNode
  invitationId: string
  initialData?: any
  themeConfig: any
  templateName: string
}) {
  const [data, setData] = useState<WizardData>(() => {
    if (initialData) {
      return {
        groomName: initialData.groomName || "",
        brideName: initialData.brideName || "",
        groomFather: initialData.groomFather || "",
        groomMother: initialData.groomMother || "",
        brideFather: initialData.brideFather || "",
        brideMother: initialData.brideMother || "",
        coverImageUrl: initialData.coverImageUrl || "",
        events: initialData.event?.length
          ? initialData.event.map((e: any) => ({
              title: e.title || "",
              date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
              timeStart: e.timeStart ? new Date(e.timeStart).toISOString().split("T")[0] : "",
              timeEnd: e.timeEnd ? new Date(e.timeEnd).toISOString().split("T")[0] : "",
              location: e.location || "",
              address: e.address || "",
              mapsUrl: e.mapsUrl || "",
            }))
          : defaultData.events,
        loveStory: initialData.loveStory
          ? typeof initialData.loveStory === "string"
            ? JSON.parse(initialData.loveStory)
            : initialData.loveStory
          : [],
        gifts: initialData.gifts
          ? typeof initialData.gifts === "string"
            ? JSON.parse(initialData.gifts)
            : initialData.gifts
          : [],
      }
    }
    return defaultData
  })

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bwa-step-${invitationId}`)
      return saved ? parseInt(saved) : 0
    }
    return 0
  })

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveServerRef = useRef<NodeJS.Timeout | null>(null)

  const saveToLocal = useCallback((d: WizardData) => {
    localStorage.setItem(`bwa-invite-${invitationId}`, JSON.stringify(d))
  }, [invitationId])

  const saveToServer = useCallback(async (d: WizardData) => {
    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      })
      if (res.ok) {
        setSaveStatus("saved")
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    }
  }, [invitationId])

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial }

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => saveToLocal(next), 2000)

      if (saveServerRef.current) clearTimeout(saveServerRef.current)
      saveServerRef.current = setTimeout(() => saveToServer(next), 3000)

      return next
    })
  }, [saveToLocal, saveToServer])

  useEffect(() => {
    localStorage.setItem(`bwa-step-${invitationId}`, currentStep.toString())
  }, [currentStep, invitationId])

  return (
    <WizardContext.Provider
      value={{ data, updateData, currentStep, setCurrentStep, saveStatus, invitationId, themeConfig, templateName }}
    >
      {children}
    </WizardContext.Provider>
  )
}

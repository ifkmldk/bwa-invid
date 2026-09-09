"use client"

import { WizardProvider } from "@/components/wizard/wizard-context"
import { WizardLayout } from "@/components/wizard/wizard-layout"

export function WizardClient({
  invitationId,
  initialData,
  themeConfig,
  templateName,
}: {
  invitationId: string
  initialData: any
  themeConfig: any
  templateName: string
}) {
  return (
    <WizardProvider
      invitationId={invitationId}
      initialData={initialData}
      themeConfig={themeConfig}
      templateName={templateName}
    >
      <WizardLayout />
    </WizardProvider>
  )
}

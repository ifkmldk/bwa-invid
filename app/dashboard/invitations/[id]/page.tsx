import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { WizardClient } from "./wizard-client"

export const dynamic = "force-dynamic"

export default async function InvitationPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    notFound()
  }

  const invitation = await prisma.invitation.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      template: true,
      event: { orderBy: { sortOrder: "asc" } },
      galleryPhotos: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!invitation) {
    notFound()
  }

  return (
    <WizardClient
      invitationId={invitation.id}
      initialData={invitation}
      themeConfig={invitation.template?.themeConfig || {}}
      templateName={invitation.template?.name || "Tanpa Template"}
    />
  )
}

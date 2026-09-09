import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateTempSlug } from "@/lib/slug"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invitations = await prisma.invitation.findMany({
      where: { userId: session.user.id },
      include: { template: true },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil undangan" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: "Template harus dipilih" }, { status: 400 })
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 })
    }

    const slug = generateTempSlug()

    const invitation = await prisma.invitation.create({
      data: {
        slug,
        templateId,
        themeConfig: template.themeConfig as any,
        userId: session.user.id,
        status: "DRAFT",
      },
    })

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat undangan" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.invitation.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { status: "UNPUBLISHED" },
      include: {
        template: true,
        event: { orderBy: { sortOrder: "asc" } },
        galleryPhotos: { orderBy: { sortOrder: "asc" } },
      },
    })

    return NextResponse.json({ invitation: updated })
  } catch (error) {
    return NextResponse.json({ error: "Gagal unpublish undangan" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function findPublished(slug: string) {
  return prisma.invitation.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const invitation = await findPublished(slug)
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }
    const wishes = await prisma.wish.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json({ wishes })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil ucapan" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const invitation = await findPublished(slug)
    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!name || !message) {
      return NextResponse.json({ error: "Nama dan ucapan wajib diisi" }, { status: 400 })
    }
    if (name.length > 80 || message.length > 500) {
      return NextResponse.json({ error: "Nama maksimal 80 karakter, ucapan maksimal 500 karakter" }, { status: 400 })
    }

    const wish = await prisma.wish.create({
      data: { name, message, invitationId: invitation.id },
    })
    return NextResponse.json({ wish }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim ucapan" }, { status: 500 })
  }
}
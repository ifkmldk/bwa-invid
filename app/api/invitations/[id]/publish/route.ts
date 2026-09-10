import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

function randomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

async function findFreeSlug(base: string): Promise<string> {
  const clean = slugify(base) || "undangan"
  const candidates = [clean]
  for (let i = 2; i <= 10; i++) candidates.push(`${clean}-${i}`)
  candidates.push(`${clean}-${randomSuffix()}`)
  for (const slug of candidates) {
    const taken = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!taken) return slug
  }
  return `${clean}-${Date.now().toString(36)}`
}

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
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId: session.user.id },
      include: { event: true },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }

    if (!invitation.groomName?.trim() || !invitation.brideName?.trim()) {
      return NextResponse.json(
        { error: "Nama kedua mempelai wajib diisi sebelum publish" },
        { status: 422 }
      )
    }

    const hasEvent = invitation.event.some((e) => e.title?.trim() && e.date)
    if (!hasEvent) {
      return NextResponse.json(
        { error: "Minimal satu acara dengan judul dan tanggal wajib ada sebelum publish" },
        { status: 422 }
      )
    }

    let slug = invitation.slug
    if (!slug || slug.startsWith("draft-")) {
      const base = `${invitation.groomName} ${invitation.brideName}`
      slug = await findFreeSlug(base)
    }

    try {
      const updated = await prisma.invitation.update({
        where: { id },
        data: { slug, status: "PUBLISHED" },
        include: {
          template: true,
          event: { orderBy: { sortOrder: "asc" } },
          galleryPhotos: { orderBy: { sortOrder: "asc" } },
        },
      })
      return NextResponse.json({ invitation: updated })
    } catch (e: any) {
      if (e?.code === "P2002") {
        const retry = await prisma.invitation.update({
          where: { id },
          data: {
            slug: `${slugify(`${invitation.groomName} ${invitation.brideName}`) || "undangan"}-${randomSuffix(6)}`,
            status: "PUBLISHED",
          },
          include: {
            template: true,
            event: { orderBy: { sortOrder: "asc" } },
            galleryPhotos: { orderBy: { sortOrder: "asc" } },
          },
        })
        return NextResponse.json({ invitation: retry })
      }
      throw e
    }
  } catch (error) {
    return NextResponse.json({ error: "Gagal publish undangan" }, { status: 500 })
  }
}
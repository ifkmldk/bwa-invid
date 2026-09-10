import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
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
      include: {
        template: true,
        event: { orderBy: { sortOrder: "asc" } },
        galleryPhotos: { orderBy: { sortOrder: "asc" } },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil undangan" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.invitation.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 })
    }

    const { events, gallery, loveStory, gifts, ...fields } = body

    // themeConfig dikunci dari template saat create; slug/status hanya lewat
    // endpoint publish/unpublish. Field di luar whitelist diabaikan agar
    // end-user tidak bisa mengoverride tema atau status seenaknya.
    const ALLOWED_FIELDS = [
      "groomName",
      "brideName",
      "groomFather",
      "groomMother",
      "brideFather",
      "brideMother",
      "coverImageUrl",
    ] as const

    const updateData: any = {}
    for (const key of ALLOWED_FIELDS) {
      if (fields[key] !== undefined) {
        updateData[key] = fields[key]
      }
    }
    if (loveStory !== undefined) updateData.loveStory = loveStory
    if (gifts !== undefined) updateData.gifts = gifts

    const invitation = await prisma.invitation.update({
      where: { id },
      data: updateData,
    })

    if (events && Array.isArray(events)) {
      await prisma.event.deleteMany({ where: { invitationId: id } })

      if (events.length > 0) {
        await prisma.event.createMany({
          data: events.map((event: any, index: number) => ({
            title: event.title,
            date: new Date(event.date),
            timeStart: event.timeStart ? new Date(event.timeStart) : null,
            timeEnd: event.timeEnd ? new Date(event.timeEnd) : null,
            location: event.location || null,
            address: event.address || null,
            mapsUrl: event.mapsUrl || null,
            sortOrder: index,
            invitationId: id,
          })),
        })
      }
    }

    if (gallery && Array.isArray(gallery)) {
      await prisma.galleryPhoto.deleteMany({ where: { invitationId: id } })

      if (gallery.length > 0) {
        await prisma.galleryPhoto.createMany({
          data: gallery
            .filter((photo: any) => photo && typeof photo.url === "string" && photo.url.trim())
            .map((photo: any, index: number) => ({
              url: photo.url.trim(),
              caption: typeof photo.caption === "string" && photo.caption.trim() ? photo.caption.trim() : null,
              sortOrder: index,
              invitationId: id,
            })),
        })
      }
    }

    const updated = await prisma.invitation.findFirst({
      where: { id },
      include: {
        template: true,
        event: { orderBy: { sortOrder: "asc" } },
        galleryPhotos: { orderBy: { sortOrder: "asc" } },
      },
    })

    return NextResponse.json({ invitation: updated })
  } catch (error) {
    return NextResponse.json({ error: "Gagal update undangan" }, { status: 500 })
  }
}

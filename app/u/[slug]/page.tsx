import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Countdown, WishForm } from "./public-parts"

export const dynamic = "force-dynamic"

interface Theme {
  backgroundColor?: string
  primaryColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
}

function resolveTheme(invitation: any): Required<Theme> {
  const raw = invitation.themeConfig ?? invitation.template?.themeConfig ?? {}
  const theme: Theme = typeof raw === "string" ? JSON.parse(raw) : raw || {}
  return {
    backgroundColor: theme.backgroundColor || "#ffffff",
    primaryColor: theme.primaryColor || "#8AA69B",
    textColor: theme.textColor || "#2E2A26",
    accentColor: theme.accentColor || "#E5DDD2",
    fontFamily: theme.fontFamily || "var(--font-display)",
  }
}

async function getPublished(slug: string) {
  return prisma.invitation.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      template: true,
      event: { orderBy: { sortOrder: "asc" } },
      galleryPhotos: { orderBy: { sortOrder: "asc" } },
      wishes: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const invitation = await getPublished(slug)
  if (!invitation) return { title: "Undangan tidak ditemukan" }

  const names =
    invitation.groomName && invitation.brideName
      ? `${invitation.groomName} & ${invitation.brideName}`
      : "Undangan Pernikahan"
  const firstEvent = invitation.event[0]
  const description = firstEvent
    ? `${names} — ${firstEvent.title}, ${new Date(firstEvent.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${firstEvent.location ? ` di ${firstEvent.location}` : ""}.`
    : `${names} — dengan penuh sukacita mengundangmu ke acara pernikahan kami.`

  return {
    title: `${names} — Undangan Pernikahan`,
    description,
    openGraph: {
      title: `${names} — Undangan Pernikahan`,
      description,
      type: "website",
      ...(invitation.coverImageUrl ? { images: [{ url: invitation.coverImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${names} — Undangan Pernikahan`,
      description,
      ...(invitation.coverImageUrl ? { images: [invitation.coverImageUrl] } : {}),
    },
  }
}

function toStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`
}

function googleCalendarHref(event: any, names: string): string {
  const start = event.timeStart ? new Date(event.timeStart) : new Date(event.date)
  const end = event.timeEnd
    ? new Date(event.timeEnd)
    : new Date(start.getTime() + 2 * 3600000)
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title} — ${names}`,
    dates: `${toStamp(start)}/${toStamp(end)}`,
    details: `Undangan ${event.title} ${names}`,
    location: event.location || event.address || "",
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}

function icsHref(event: any, names: string): string {
  const start = event.timeStart ? new Date(event.timeStart) : new Date(event.date)
  const end = event.timeEnd
    ? new Date(event.timeEnd)
    : new Date(start.getTime() + 2 * 3600000)
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${event.id}@undanganku`,
    `DTSTAMP:${toStamp(new Date())}`,
    `DTSTART:${toStamp(start)}`,
    `DTEND:${toStamp(end)}`,
    `SUMMARY:${event.title} — ${names}`,
    `LOCATION:${event.location || event.address || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}

function mapsHref(event: any): string | null {
  if (event.mapsUrl) return event.mapsUrl
  const query = [event.location, event.address].filter(Boolean).join(", ")
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function parseList(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const invitation = await getPublished(slug)
  if (!invitation) notFound()

  const theme = resolveTheme(invitation)
  const names =
    invitation.groomName && invitation.brideName
      ? `${invitation.groomName} & ${invitation.brideName}`
      : "Undangan Pernikahan"

  const datedEvents = invitation.event.filter((e) => e.date)
  const nearest =
    datedEvents.length > 0
      ? [...datedEvents].sort((a, b) => +new Date(a.date) - +new Date(b.date))[0]
      : null

  const loveStory = parseList(invitation.loveStory)
  const gifts = parseList(invitation.gifts)

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div className="mx-auto w-full max-w-md px-4 pb-16">
        <section data-testid="public-hero" className="pt-10 text-center">
          <p className="text-xs uppercase tracking-widest opacity-70">Undangan Pernikahan</p>
          {invitation.coverImageUrl && (
            <img
              src={invitation.coverImageUrl}
              alt={`Foto cover ${names}`}
              className="mx-auto mt-5 h-56 w-full max-w-sm rounded-2xl object-cover"
            />
          )}
        </section>

        <section
          data-testid="public-header"
          className="mt-6 rounded-2xl p-6 text-center"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <h1
            data-testid="public-names"
            className="text-2xl text-white"
            style={{ fontFamily: theme.fontFamily }}
          >
            {names}
          </h1>
          {nearest && (
            <div className="mt-5 text-white">
              <Countdown targetIso={new Date(nearest.date).toISOString()} />
              <p className="mt-3 text-xs opacity-80">
                {new Date(nearest.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </section>

        {invitation.event.length > 0 && (
          <section className="mt-6 space-y-4">
            {invitation.event.map((event) => {
              const maps = mapsHref(event)
              return (
                <article
                  key={event.id}
                  data-testid="public-event"
                  className="rounded-2xl border bg-white/70 p-5 text-center"
                  style={{ borderColor: theme.accentColor }}
                >
                  <h2 className="font-semibold" style={{ color: theme.textColor }}>
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm opacity-80">
                    {new Date(event.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {event.location && <p className="mt-1 text-sm font-medium">{event.location}</p>}
                  {event.address && <p className="mt-0.5 text-xs opacity-70">{event.address}</p>}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {maps && (
                      <a
                        data-testid="event-maps"
                        href={maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Buka Peta
                      </a>
                    )}
                    <a
                      data-testid="calendar-google"
                      href={googleCalendarHref(event, names)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border px-4 py-2 text-xs font-semibold"
                      style={{ borderColor: theme.accentColor }}
                    >
                      Google Calendar
                    </a>
                    <a
                      data-testid="calendar-ics"
                      href={icsHref(event, names)}
                      download={`${event.title}.ics`}
                      className="rounded-xl border px-4 py-2 text-xs font-semibold"
                      style={{ borderColor: theme.accentColor }}
                    >
                      Simpan .ics
                    </a>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {invitation.galleryPhotos.length > 0 && (
          <section className="mt-8">
            <h2 className="text-center font-semibold">Galeri</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {invitation.galleryPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption || "Foto galeri"}
                  loading="lazy"
                  className="h-36 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {loveStory.length > 0 && (
          <section className="mt-8">
            <h2 className="text-center font-semibold">Cerita Cinta Kami</h2>
            <div className="mt-3 space-y-3">
              {loveStory.map((m: any, i: number) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white/70 p-4 text-center"
                  style={{ borderColor: theme.accentColor }}
                >
                  {m.date && (
                    <p className="text-xs font-medium" style={{ color: theme.primaryColor }}>
                      {new Date(m.date).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <p className="mt-1 text-sm">{m.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {gifts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-center font-semibold">Hadiah</h2>
            <div className="mt-3 space-y-3">
              {gifts.map((g: any, i: number) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white/70 p-4 text-center text-sm"
                  style={{ borderColor: theme.accentColor }}
                >
                  <p className="font-medium">{g.bankName}</p>
                  <p>{g.accountNumber}</p>
                  <p>{g.accountName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-center font-semibold">Ucapan & Doa</h2>
          <div className="mt-3">
            <WishForm
              slug={slug}
              initialWishes={invitation.wishes.map((w) => ({
                id: w.id,
                name: w.name,
                message: w.message,
                createdAt: w.createdAt.toISOString(),
              }))}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
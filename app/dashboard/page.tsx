import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const invitations = await prisma.invitation.findMany({
    where: { userId: session!.user.id },
    include: { template: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Undangan Saya</h1>
          <p className="text-sm text-ink-soft mt-1">Kelola undangan digitalmu</p>
        </div>
        <Link
          href="/dashboard/templates"
          className="px-4 py-2.5 bg-maroon text-white text-sm font-semibold rounded-xl hover:bg-maroon-deep transition-colors shadow-sm inline-flex items-center gap-2"
        >
          + Buat Undangan Baru
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blush/25 flex items-center justify-center">
            <svg className="w-10 h-10 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4.5 6.5 4.5c2 0 3.5 1 4.5 2.5 1-1.5 2.5-2.5 4.5-2.5 3.5 0 6 4 3.5 8C19 16.65 12 21 12 21z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">Belum ada undangan</h3>
          <p className="text-ink-soft mb-6 max-w-md mx-auto">
            Mulai buat undangan pertamamu dalam beberapa langkah mudah.
          </p>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon text-white text-sm font-semibold rounded-xl hover:bg-maroon-deep shadow-sm transition-colors"
          >
            Pilih Template Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitations.map((inv) => (
            <Link
              key={inv.id}
              href={`/dashboard/invitations/${inv.id}`}
              className="block bg-white rounded-xl border border-line p-5 hover:shadow-[0_2px_24px_rgba(46,42,38,0.08)] hover:border-blush transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${inv.status === "PUBLISHED" ? "bg-sage/15 text-ink" : "bg-blush/25 text-maroon"}`}
                >
                  {inv.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
              <h3 className="font-medium text-ink mb-1">
                {inv.groomName && inv.brideName
                  ? `${inv.groomName} & ${inv.brideName}`
                  : "Belum diisi"}
              </h3>
              <p className="text-sm text-ink-soft mb-3">
                {inv.template?.name || "Tanpa template"}
              </p>
              <p className="text-xs text-ink-soft/60">
                Diperbarui {new Date(inv.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

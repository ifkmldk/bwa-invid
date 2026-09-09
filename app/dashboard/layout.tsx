import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Sidebar userName={session.user.name || session.user.email} />
      <div className="md:ml-64">
        {/* pt-16 di mobile agar konten tidak tertutup tombol menu (top-4 + tinggi ~40px), kembali normal di desktop */}
        <main className="pt-16 px-4 md:pt-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}

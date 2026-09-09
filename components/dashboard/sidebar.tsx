"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/templates", label: "Template", icon: "template" },
]

export function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg border border-line shadow-sm"
        aria-label="Buka menu"
      >
        <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-line z-40 transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-line">
            <h1 className="font-display text-2xl tracking-tight text-ink">Undanganku</h1>
            <p className="text-xs text-ink-soft mt-1">Undangan digital Indonesia</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-blush/25 text-maroon"
                      : "text-ink-soft hover:bg-blush/10 hover:text-ink"
                    }`}
                >
                  {item.icon === "home" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {item.icon === "template" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-line">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blush/30 flex items-center justify-center text-sm font-medium text-maroon">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-sm font-medium text-ink truncate">{userName || "User"}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full text-left text-sm text-ink-soft hover:text-maroon px-3 py-2 rounded-lg hover:bg-blush/15 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

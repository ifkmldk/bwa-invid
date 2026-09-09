"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal reset kata sandi")
        setLoading(false)
        return
      }

      setSuccess("Kata sandi berhasil diubah! Mengalihkan ke halaman masuk...")
      setLoading(false)
      setTimeout(() => { window.location.href = "/sign-in" }, 2000)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 bg-ivory">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sage/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-maroon/30 bg-white/60 mb-4">
            <svg className="w-6 h-6 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Atur Ulang Kata Sandi</h1>
          <p className="mt-2 text-sm text-ink-soft">Buat kata sandi baru untuk akunmu</p>
        </div>

        <div className="rounded-2xl border border-line bg-white/80 backdrop-blur-sm p-8 shadow-[0_2px_24px_rgba(46,42,38,0.06)]">
          {!token ? (
            <div className="py-4 text-center">
              <p className="text-sm text-ink-soft">
                Token reset tidak ditemukan. Minta link reset baru dari{" "}
                <a href="/forgot-password" className="font-medium text-maroon hover:text-maroon-deep">
                  halaman ini
                </a>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-blush-deep/40 bg-blush/20 p-3.5 text-sm text-ink">
                  <svg className="w-4 h-4 mt-0.5 text-maroon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-sage/40 bg-sage/15 p-3.5 text-sm text-ink">
                  <svg className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75m-3-6a9 9 0 110 18 9 9 0 010-18z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/60 transition-colors focus:border-maroon focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/60 transition-colors focus:border-maroon focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-maroon px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-maroon-deep disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <a href="/sign-in" className="text-sm text-ink-soft hover:text-ink transition-colors">
              &larr; Kembali ke halaman masuk
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center">Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}


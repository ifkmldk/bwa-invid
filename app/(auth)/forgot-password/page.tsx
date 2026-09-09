"use client"

import { useState } from "react"

export default function ForgotPassword() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      await res.json()
      setSuccess("Jika email terdaftar, tautan reset sudah dikirim. Cek console (dev mode).")
      setLoading(false)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 bg-ivory">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-sage/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-maroon/30 bg-white/60 mb-4">
            <svg className="w-6 h-6 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5m-7.5 0a3.75 3.75 0 117.5 0m-7.5 0H5.25a1.5 1.5 0 00-1.5 1.5v9a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-9a1.5 1.5 0 00-1.5-1.5h-1.5m-7.5 0v.008" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Lupa Kata Sandi</h1>
          <p className="mt-2 text-sm text-ink-soft">Masukkan email untuk mendapatkan tautan reset</p>
        </div>

        <div className="rounded-2xl border border-line bg-white/80 backdrop-blur-sm p-8 shadow-[0_2px_24px_rgba(46,42,38,0.06)]">
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
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/60 transition-colors focus:border-maroon focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-maroon px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-maroon-deep disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>

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

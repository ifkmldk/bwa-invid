"use client"

import { useState } from "react"

export default function SignUp() {
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
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal mendaftar")
        setLoading(false)
        return
      }

      setSuccess("Akun berhasil dibuat! Cek console untuk link verifikasi (dev mode).")
      setLoading(false)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 sm:px-6">
      <div aria-hidden className="absolute inset-0 bg-ivory">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-sage/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-maroon/30 bg-white/60 mb-4">
            <svg className="w-7 h-7 text-maroon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-ink">Mulai Kisahmu</h1>
          <p className="mt-2 text-sm text-ink-soft">Buat undangan digital pertamamu</p>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Kata Sandi
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-maroon px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-maroon-deep disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                  </svg>
                  Mendaftar...
                </span>
              ) : "Daftar"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-sm text-ink-soft">
              Sudah punya akun?{" "}
              <a href="/sign-in" className="font-medium text-maroon hover:text-maroon-deep transition-colors">
                Masuk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Ambient backdrop — tekstur halus khas undangan, bukan gradient generik */}
      <div aria-hidden className="absolute inset-0 bg-ivory">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-sage/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-maroon/30 bg-white/60 mb-4">
            <svg className="w-6 h-6 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4.5 6.5 4.5c2 0 3.5 1 4.5 2.5 1-1.5 2.5-2.5 4.5-2.5 3.5 0 6 4 3.5 8C19 16.65 12 21 12 21z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl tracking-tight text-ink">Undanganku</h1>
          <p className="mt-2 text-sm text-ink-soft">Lanjutkan kisah undanganmu</p>
        </div>

        {/* Card form */}
        <div className="rounded-2xl border border-line bg-white/80 backdrop-blur-sm p-8 shadow-[0_2px_24px_rgba(46,42,38,0.06)]">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-blush-deep/40 bg-blush/20 p-3.5 text-sm text-ink"
            >
              <svg className="w-4 h-4 mt-0.5 text-maroon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  Kata Sandi
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-maroon hover:text-maroon-deep transition-colors"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Masukkan kata sandi"
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
                  Masuk...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-sm text-ink-soft">
              Belum punya akun?{" "}
              <a href="/sign-up" className="font-medium text-maroon hover:text-maroon-deep transition-colors">
                Daftar di sini
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft/70">
          Undangan digital untuk setiap kisah Indonesia
        </p>
      </div>
    </div>
  )
}

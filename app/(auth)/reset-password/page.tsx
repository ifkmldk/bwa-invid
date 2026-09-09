"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function ResetPassword() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Atur Ulang Kata Sandi
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan kata sandi baru untuk akunmu
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!token ? (
            <p className="text-center text-sm text-gray-600">
              Token reset tidak ditemukan. Minta link reset baru dari{" "}
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                halaman ini
              </a>.
            </p>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Kata Sandi Baru
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                  </button>
                </div>
              </form>
            </>
          )}
          <div className="mt-6">
            <p className="mt-2 text-center text-sm text-gray-600">
              Kembali ke{" "}
              <a href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                halaman masuk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

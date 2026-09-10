"use client"

import { useEffect, useState } from "react"
import { useWizard } from "../wizard-context"

interface PublishMeta {
  status: string
  slug: string
}

export function SettingsStep() {
  const { data, updateData, invitationId } = useWizard()
  const [meta, setMeta] = useState<PublishMeta | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const inputCls = "w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"

  async function refresh() {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`)
      if (!res.ok) return
      const body = await res.json()
      setMeta({ status: body.invitation.status, slug: body.invitation.slug })
    } catch {
      // diamkan: panel publish coba lagi saat tombol ditekan
    }
  }

  useEffect(() => {
    refresh()
  }, [invitationId])

  const publicPath = meta ? `/u/${meta.slug}` : null
  const waShare = publicPath
    ? `https://wa.me/?text=${encodeURIComponent(`Datang yuk ke acara pernikahan kami! ${publicPath}`)}`
    : null

  async function publish() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/${invitationId}/publish`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Gagal publish")
      setMeta({ status: body.invitation.status, slug: body.invitation.slug })
    } catch (e: any) {
      setError(e.message || "Gagal publish")
    } finally {
      setBusy(false)
    }
  }

  async function unpublish() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/invitations/${invitationId}/unpublish`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Gagal unpublish")
      setMeta({ status: body.invitation.status, slug: body.invitation.slug })
    } catch (e: any) {
      setError(e.message || "Gagal unpublish")
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    if (!publicPath) return
    const url = `${window.location.origin}${publicPath}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPublished = meta?.status === "PUBLISHED"

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Pengaturan</h3>
        <p className="text-sm text-ink-soft">Pengaturan tambahan untuk undanganmu</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">URL Foto Cover</label>
        <input
          type="url"
          value={data.coverImageUrl}
          onChange={(e) => updateData({ coverImageUrl: e.target.value })}
          placeholder="https://..."
          className={inputCls}
        />
        <p className="text-xs text-ink-soft/60 mt-1">Upload foto cover akan tersedia di update berikutnya</p>
      </div>

      <div className="border border-line rounded-xl p-4 space-y-3" data-testid="publish-panel">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Publish Undangan</p>
          {meta && (
            <span
              data-testid="publish-status"
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublished ? "bg-sage/15 text-ink" : "bg-blush/25 text-maroon"}`}
            >
              {isPublished ? "Published" : meta.status === "UNPUBLISHED" ? "Unpublished" : "Draft"}
            </span>
          )}
        </div>

        {isPublished && publicPath ? (
          <div className="space-y-3">
            <a
              data-testid="public-link"
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-maroon underline break-all"
            >
              {publicPath}
            </a>
            <div className="flex flex-wrap gap-2">
              <button
                data-testid="copy-link"
                onClick={copyLink}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-line hover:bg-blush/15 transition-colors"
              >
                {copied ? "Tersalin!" : "Salin Link"}
              </button>
              {waShare && (
                <a
                  data-testid="wa-share"
                  href={waShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sage hover:bg-sage/90 transition-colors"
                >
                  Bagikan via WhatsApp
                </a>
              )}
              <button
                onClick={unpublish}
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-maroon/30 text-maroon hover:bg-maroon/10 transition-colors disabled:opacity-50"
              >
                {busy ? "Memproses..." : "Unpublish"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-ink-soft">
              Publish agar undangan bisa diakses publik lewat link cantik otomatis (mis. /u/budi-anisa).
            </p>
            <button
              data-testid="publish-button"
              onClick={publish}
              disabled={busy}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-maroon hover:bg-maroon-deep rounded-xl transition-colors disabled:opacity-50"
            >
              {busy ? "Memproses..." : "Publish Sekarang"}
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="text-xs text-maroon">{error}</p>
        )}
      </div>
    </div>
  )
}
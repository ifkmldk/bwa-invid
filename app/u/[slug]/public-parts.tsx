"use client"

import { useEffect, useState } from "react"

function diffParts(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { diff, days, hours, minutes, seconds }
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const targetMs = new Date(targetIso).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const { diff, days, hours, minutes, seconds } = diffParts(targetMs, now)
  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div data-testid="countdown" data-target={targetIso} className="flex items-center justify-center gap-2">
      {diff <= 0 ? (
        <p className="text-sm font-semibold">Acara telah berlangsung</p>
      ) : (
        <>
          {[
            { v: String(days), l: "Hari" },
            { v: pad(hours), l: "Jam" },
            { v: pad(minutes), l: "Menit" },
            { v: pad(seconds), l: "Detik" },
          ].map((b) => (
            <div key={b.l} className="min-w-16 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
              <p className="text-xl font-bold tabular-nums">{b.v}</p>
              <p className="text-[11px] uppercase tracking-wide opacity-80">{b.l}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

interface Wish {
  id: string
  name: string
  message: string
  createdAt: string
}

export function WishForm({ slug, initialWishes }: { slug: string; initialWishes: Wish[] }) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim() || status === "sending") return
    setStatus("sending")
    try {
      const res = await fetch(`/api/u/${slug}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      })
      if (!res.ok) throw new Error("failed")
      const body = await res.json()
      setWishes((w) => [body.wish, ...w])
      setName("")
      setMessage("")
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-3">
        <input
          aria-label="Nama"
          placeholder="Namamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full px-4 py-3 rounded-xl border border-line text-sm focus:outline-none"
        />
        <textarea
          aria-label="Ucapan"
          placeholder="Tulis ucapan & doa terbaikmu..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-line text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--wish-accent, #8A5341)" }}
        >
          {status === "sending" ? "Mengirim..." : "Kirim Ucapan"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-xs text-red-700">Gagal mengirim ucapan, coba lagi.</p>
        )}
      </form>

      <div data-testid="wish-list" className="mt-5 space-y-3">
        {wishes.length === 0 && (
          <p className="text-sm text-center opacity-70">Belum ada ucapan. Jadilah yang pertama!</p>
        )}
        {wishes.map((w) => (
          <div key={w.id} className="rounded-xl border border-line bg-white/60 px-4 py-3">
            <p className="text-sm font-semibold">{w.name}</p>
            <p className="text-sm mt-0.5">{w.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
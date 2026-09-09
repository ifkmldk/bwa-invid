"use client"

import { useWizard } from "./wizard-context"

export function WizardPreview() {
  const { data, themeConfig } = useWizard()

  const theme = typeof themeConfig === "string" ? JSON.parse(themeConfig) : themeConfig || {}

  return (
    <div
      className="rounded-xl overflow-hidden shadow-[0_2px_24px_rgba(46,42,38,0.08)] border border-line"
      style={{ backgroundColor: theme.backgroundColor || "#ffffff" }}
    >
      <div
        className="p-6 text-center"
        style={{ backgroundColor: theme.primaryColor || "#8AA69B" }}
      >
        <h2
          className="text-xl text-white mb-1"
          style={{ fontFamily: theme.fontFamily || "var(--font-display)" }}
        >
          {data.groomName || "Nama Pria"} &amp; {data.brideName || "Nama Wanita"}
        </h2>
        {data.groomFather && data.brideFather && (
          <p className="text-white/70 text-xs mt-2">
            Putra {data.groomFather} &amp; Putri {data.brideFather}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {data.events.map((event, i) => (
          <div key={i} className="text-center">
            <h3 className="font-semibold text-sm" style={{ color: theme.textColor || "#2E2A26" }}>
              {event.title || "Judul Acara"}
            </h3>
            {event.date && (
              <p className="text-xs mt-1" style={{ color: theme.textColor || "#6B655D" }}>
                {new Date(event.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {event.timeStart && ` · ${event.timeStart}`}
              </p>
            )}
            {event.location && (
              <p className="text-xs" style={{ color: theme.textColor || "#8F887D" }}>{event.location}</p>
            )}
          </div>
        ))}

        {data.gallery.length > 0 && (
          <>
            <div className="border-t pt-4" style={{ borderColor: theme.accentColor || "#E5DDD2" }} />
            <h3 className="font-semibold text-sm text-center" style={{ color: theme.textColor || "#2E2A26" }}>
              Galeri
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {data.gallery.map((photo, i) => (
                <img
                  key={i}
                  src={photo.url}
                  alt={photo.caption || `Foto ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          </>
        )}

        {data.loveStory.length > 0 && (
          <>
            <div className="border-t pt-4" style={{ borderColor: theme.accentColor || "#E5DDD2" }} />
            <h3 className="font-semibold text-sm text-center" style={{ color: theme.textColor || "#2E2A26" }}>
              Cerita Cinta Kami
            </h3>
            <div className="space-y-2">
              {data.loveStory.map((m, i) => (
                <div key={i} className="text-center">
                  {m.date && (
                    <p className="text-xs font-medium" style={{ color: theme.primaryColor || "#8AA69B" }}>
                      {new Date(m.date).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: theme.textColor || "#6B655D" }}>{m.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {data.gifts.length > 0 && (
          <>
            <div className="border-t pt-4" style={{ borderColor: theme.accentColor || "#E5DDD2" }} />
            <h3 className="font-semibold text-sm text-center" style={{ color: theme.textColor || "#2E2A26" }}>
              Hadiah
            </h3>
            <div className="space-y-2">
              {data.gifts.map((g, i) => (
                <div key={i} className="text-center text-xs" style={{ color: theme.textColor || "#6B655D" }}>
                  <p className="font-medium">{g.bankName}</p>
                  <p>{g.accountNumber}</p>
                  <p>{g.accountName}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { useWizard } from "../wizard-context"

export function EventsStep() {
  const { data, updateData } = useWizard()

  function addEvent() {
    updateData({
      events: [
        ...data.events,
        { title: "Resepsi", date: "", timeStart: "", timeEnd: "", location: "", address: "", mapsUrl: "" },
      ],
    })
  }

  function removeEvent(index: number) {
    if (data.events.length <= 1) return
    updateData({ events: data.events.filter((_, i) => i !== index) })
  }

  function updateEvent(index: number, field: string, value: string) {
    const updated = [...data.events]
    updated[index] = { ...updated[index], [field]: value }
    updateData({ events: updated })
  }

  const inputCls = "w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Detail Acara</h3>
        <p className="text-sm text-ink-soft">Tambahkan jadwal acara pernikahanmu</p>
      </div>

      {data.events.map((event, index) => (
        <div key={index} className="border border-line rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-ink">Acara {index + 1}</h4>
            {data.events.length > 1 && (
              <button
                onClick={() => removeEvent(index)}
                className="text-sm text-maroon hover:text-maroon-deep"
              >
                Hapus
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Judul Acara <span className="text-maroon">*</span>
            </label>
            <input
              type="text"
              value={event.title}
              onChange={(e) => updateEvent(index, "title", e.target.value)}
              placeholder="Contoh: Akad Nikah, Resepsi"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Tanggal <span className="text-maroon">*</span>
              </label>
              <input
                type="date"
                value={event.date}
                onChange={(e) => updateEvent(index, "date", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Mulai</label>
                <input
                  type="time"
                  value={event.timeStart}
                  onChange={(e) => updateEvent(index, "timeStart", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Selesai</label>
                <input
                  type="time"
                  value={event.timeEnd}
                  onChange={(e) => updateEvent(index, "timeEnd", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Lokasi</label>
            <input
              type="text"
              value={event.location}
              onChange={(e) => updateEvent(index, "location", e.target.value)}
              placeholder="Contoh: Masjid Istiqlal"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Alamat</label>
            <textarea
              value={event.address}
              onChange={(e) => updateEvent(index, "address", e.target.value)}
              placeholder="Alamat lengkap lokasi"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Link Google Maps</label>
            <input
              type="url"
              value={event.mapsUrl}
              onChange={(e) => updateEvent(index, "mapsUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
              className={inputCls}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addEvent}
        className="w-full py-3 border-2 border-dashed border-line rounded-xl text-sm font-medium text-ink-soft hover:border-blush hover:text-maroon transition-colors"
      >
        + Tambah Acara
      </button>
    </div>
  )
}

"use client"

import { useWizard } from "../wizard-context"

export function SettingsStep() {
  const { data, updateData } = useWizard()

  const inputCls = "w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"

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

      <div className="bg-blush/15 border border-blush/30 rounded-xl p-4">
        <p className="text-sm text-ink">
          <strong>Catatan:</strong> Setelah mengisi semua data, kamu bisa langsung menyimpan draft ini.
          Fitur Publish akan tersedia setelah semua data lengkap diisi.
        </p>
      </div>
    </div>
  )
}

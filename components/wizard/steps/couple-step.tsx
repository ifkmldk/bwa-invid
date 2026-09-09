"use client"

import { useWizard } from "../wizard-context"

export function CoupleStep() {
  const { data, updateData } = useWizard()

  const fields = [
    { key: "groomName", label: "Nama Mempelai Pria", placeholder: "Nama lengkap" },
    { key: "brideName", label: "Nama Mempelai Wanita", placeholder: "Nama lengkap" },
    { key: "groomFather", label: "Nama Ayah Mempelai Pria", placeholder: "Bapak ..." },
    { key: "groomMother", label: "Nama Ibu Mempelai Pria", placeholder: "Ibu ..." },
    { key: "brideFather", label: "Nama Ayah Mempelai Wanita", placeholder: "Bapak ..." },
    { key: "brideMother", label: "Nama Ibu Mempelai Wanita", placeholder: "Ibu ..." },
  ] as const

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Data Pasangan</h3>
        <p className="text-sm text-ink-soft">Isi nama lengkap mempelai dan orang tua</p>
      </div>

      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {field.label}
            {field.key === "groomName" || field.key === "brideName" ? (
              <span className="text-maroon ml-0.5">*</span>
            ) : null}
          </label>
          <input
            type="text"
            value={data[field.key]}
            onChange={(e) => updateData({ [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"
          />
        </div>
      ))}
    </div>
  )
}

"use client"

import { useWizard } from "../wizard-context"

export function GiftsStep() {
  const { data, updateData } = useWizard()

  const inputCls = "w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"

  function addGift() {
    updateData({
      gifts: [...data.gifts, { bankName: "", accountNumber: "", accountName: "" }],
    })
  }

  function removeGift(index: number) {
    updateData({ gifts: data.gifts.filter((_, i) => i !== index) })
  }

  function updateGift(index: number, field: string, value: string) {
    const updated = [...data.gifts]
    updated[index] = { ...updated[index], [field]: value }
    updateData({ gifts: updated })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Info Hadiah</h3>
        <p className="text-sm text-ink-soft">Tambahkan rekening atau alamat kirim hadiah (opsional)</p>
      </div>

      {data.gifts.map((gift, index) => (
        <div key={index} className="border border-line rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-ink">Rekening {index + 1}</h4>
            <button
              onClick={() => removeGift(index)}
              className="text-sm text-maroon hover:text-maroon-deep"
            >
              Hapus
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Bank</label>
            <input
              type="text"
              value={gift.bankName}
              onChange={(e) => updateGift(index, "bankName", e.target.value)}
              placeholder="Contoh: Bank BCA, Bank Mandiri"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nomor Rekening</label>
            <input
              type="text"
              value={gift.accountNumber}
              onChange={(e) => updateGift(index, "accountNumber", e.target.value)}
              placeholder="1234567890"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Atas Nama</label>
            <input
              type="text"
              value={gift.accountName}
              onChange={(e) => updateGift(index, "accountName", e.target.value)}
              placeholder="Nama pemilik rekening"
              className={inputCls}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addGift}
        className="w-full py-3 border-2 border-dashed border-line rounded-xl text-sm font-medium text-ink-soft hover:border-blush hover:text-maroon transition-colors"
      >
        + Tambah Rekening
      </button>
    </div>
  )
}

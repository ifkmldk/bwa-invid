"use client"

import { useWizard } from "../wizard-context"

export function LoveStoryStep() {
  const { data, updateData } = useWizard()

  const inputCls = "w-full px-4 py-3 border border-line rounded-xl text-ink text-sm focus:border-maroon focus:outline-none placeholder:text-ink-soft/60"

  function addMilestone() {
    if (data.loveStory.length >= 5) return
    updateData({
      loveStory: [...data.loveStory, { date: "", description: "" }],
    })
  }

  function removeMilestone(index: number) {
    updateData({ loveStory: data.loveStory.filter((_, i) => i !== index) })
  }

  function updateMilestone(index: number, field: string, value: string) {
    const updated = [...data.loveStory]
    updated[index] = { ...updated[index], [field]: value }
    updateData({ loveStory: updated })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Cerita Cinta</h3>
        <p className="text-sm text-ink-soft">Ceritakan perjalanan hubungan kalian (opsional, maks 5 milestone)</p>
      </div>

      {data.loveStory.map((milestone, index) => (
        <div key={index} className="border border-line rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-ink">Milestone {index + 1}</h4>
            <button
              onClick={() => removeMilestone(index)}
              className="text-sm text-maroon hover:text-maroon-deep"
            >
              Hapus
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Tanggal</label>
            <input
              type="date"
              value={milestone.date}
              onChange={(e) => updateMilestone(index, "date", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Cerita</label>
            <textarea
              value={milestone.description}
              onChange={(e) => updateMilestone(index, "description", e.target.value)}
              placeholder="Ceritakan momen ini..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      ))}

      {data.loveStory.length < 5 && (
        <button
          onClick={addMilestone}
          className="w-full py-3 border-2 border-dashed border-line rounded-xl text-sm font-medium text-ink-soft hover:border-blush hover:text-maroon transition-colors"
        >
          + Tambah Milestone
        </button>
      )}
    </div>
  )
}

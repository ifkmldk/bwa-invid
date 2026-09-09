import { z } from "zod"

export const eventSchema = z.object({
  title: z.string().min(1, "Judul acara harus diisi"),
  date: z.string().min(1, "Tanggal acara harus diisi"),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  mapsUrl: z.string().optional(),
})

export const invitationUpdateSchema = z.object({
  groomName: z.string().nullable().optional(),
  brideName: z.string().nullable().optional(),
  groomFather: z.string().nullable().optional(),
  groomMother: z.string().nullable().optional(),
  brideFather: z.string().nullable().optional(),
  brideMother: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  loveStory: z.any().nullable().optional(),
  gifts: z.any().nullable().optional(),
  events: z.array(eventSchema).optional(),
  currentStep: z.number().optional(),
})

export const createInvitationSchema = z.object({
  templateId: z.string().min(1, "Template harus dipilih"),
})

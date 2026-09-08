import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyToken } from "@/lib/auth/helpers"
import { z } from "zod"

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = resetSchema.parse(body)

    const result = await verifyToken(token, "passwordReset")
    if (!result.valid || !result.userId) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.update({
      where: { id: result.userId },
      data: { passwordHash }
    })

    return NextResponse.json({ message: "Kata sandi berhasil diubah" }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 })
    }
    return NextResponse.json({ error: "Gagal mengubah kata sandi" }, { status: 500 })
  }
}


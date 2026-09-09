import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetToken, checkSignThrottle } from "@/lib/auth/helpers"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email harus diisi" }, { status: 400 })
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const throttle = await checkSignThrottle(ip)
    if (!throttle.canSignUp) {
      return NextResponse.json({ error: throttle.message }, { status: 429 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 404 })
    }

    const resetToken = await createPasswordResetToken(user.id)

    console.log(`[DEV] Reset link: http://localhost:3000/reset-password?token=${resetToken}`)

    return NextResponse.json({
      message: "Tautan reset kata sandi dikirim",
      // Di development, kembalikan token supaya alur reset bisa diuji end-to-end
      resetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim tautan reset" }, { status: 500 })
  }
}

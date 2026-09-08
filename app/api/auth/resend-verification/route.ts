import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createVerificationToken, checkSignThrottle } from "@/lib/auth/helpers"

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

    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: "Email sudah terverifikasi" }, { status: 400 })
    }

    const verificationToken = await createVerificationToken(user.id)

    // Send verification email (dev: console)
    console.log(`[DEV] Verification link: http://localhost:3000/verify-email?token=${verificationToken}`)

    return NextResponse.json({ message: "Verifikasi email dikirim ulang" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim ulang verifikasi" }, { status: 500 })
  }
}


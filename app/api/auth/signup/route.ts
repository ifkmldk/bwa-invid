import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { hashPassword, createVerificationToken, checkSignThrottle } from "@/lib/auth/helpers"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session) {
      return NextResponse.json({ error: "Sudah masuk" }, { status: 400 })
    }

    const body = await request.json()
    const { email, password } = signupSchema.parse(body)

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const throttle = await checkSignThrottle(ip)
    if (!throttle.canSignUp) {
      return NextResponse.json({ error: throttle.message }, { status: 429 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { email, passwordHash, role: "USER" }
    })

    const verificationToken = await createVerificationToken(user.id)

    console.log(`[DEV] Verification link: http://localhost:3000/verify-email?token=${verificationToken}`)

    return NextResponse.json({ message: "Verifikasi email dikirim", verificationToken: process.env.NODE_ENV !== "production" ? verificationToken : undefined }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 })
    }
    console.error("signup error:", error)
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 })
  }
}

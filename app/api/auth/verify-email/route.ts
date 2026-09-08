import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth/helpers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 400 })
    }

    const result = await verifyToken(token, "verification")
    if (!result.valid || !result.userId) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: result.userId },
      data: { emailVerifiedAt: new Date() }
    })

    return NextResponse.json({ message: "Email diverifikasi" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal verifikasi" }, { status: 500 })
  }
}


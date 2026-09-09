import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = { isActive: true }
    if (category && category !== "all") {
      where.category = { name: category }
    }

    const templates = await prisma.template.findMany({
      where,
      include: { category: true },
      orderBy: { category: { sortOrder: "asc" } },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil template" }, { status: 500 })
  }
}

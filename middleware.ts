import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  const isPublicPath = pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password"

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
}


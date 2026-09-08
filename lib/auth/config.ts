import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "../prisma"
import { comparePassword, isAccountLocked, recordLoginAttempt } from "./helpers"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Email atau password salah")
        }

        if (!user.emailVerifiedAt) {
          throw new Error("Email belum diverifikasi")
        }

        const locked = await isAccountLocked(user.id)
        if (locked) {
          throw new Error("Akun dikunci, coba lagi nanti")
        }

        const isValid = await comparePassword(credentials.password, user.passwordHash)
        if (!isValid) {
          await recordLoginAttempt(user.id, false)
          throw new Error("Email atau password salah")
        }

        await recordLoginAttempt(user.id, true)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  }
}


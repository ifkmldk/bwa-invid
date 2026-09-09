import bcrypt from "bcrypt"
import crypto from "crypto"
import { prisma } from "../prisma"

const EMAIL_VERIFICATION_TOKEN_TTL = 24 * 60 * 60 * 1000
const PASSWORD_RESET_TOKEN_TTL = 60 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = generateToken()
  const tokenHash = await bcrypt.hash(token, 12)
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL)

  // userId unik: hapus yang lama (misal resend verification)
  await prisma.verificationToken.deleteMany({ where: { userId } })
  await prisma.verificationToken.create({
    data: { tokenHash, expiresAt, userId }
  })

  return token
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken()
  const tokenHash = await bcrypt.hash(token, 12)
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL)

  // userId unik: hapus yang lama sebelum buat baru (regenerasi)
  await prisma.passwordResetToken.deleteMany({ where: { userId } })
  await prisma.passwordResetToken.create({
    data: { tokenHash, expiresAt, userId }
  })

  return token
}

export async function verifyToken(
  token: string,
  tokenModel: "verification" | "passwordReset"
): Promise<{ valid: boolean; userId?: string }> {
  const now = new Date()

  if (tokenModel === "verification") {
    const tokens = await prisma.verificationToken.findMany({
      where: { usedAt: null, expiresAt: { gt: now } }
    })

    for (const t of tokens) {
      const isValid = await bcrypt.compare(token, t.tokenHash)
      if (isValid) {
        await prisma.verificationToken.update({
          where: { id: t.id },
          data: { usedAt: now }
        })
        return { valid: true, userId: t.userId }
      }
    }
  } else {
    const tokens = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: now } }
    })

    for (const t of tokens) {
      const isValid = await bcrypt.compare(token, t.tokenHash)
      if (isValid) {
        await prisma.passwordResetToken.update({
          where: { id: t.id },
          data: { usedAt: now }
        })
        return { valid: true, userId: t.userId }
      }
    }
  }

  return { valid: false }
}

export async function checkSignThrottle(
  ip: string
): Promise<{ canSignUp: boolean; message?: string }> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + 60 * 60 * 1000)

  const existing = await prisma.signThrottle.findUnique({
    where: { ip }
  })

  if (!existing) {
    await prisma.signThrottle.create({
      data: { ip, count: 1, resetAt }
    })
    return { canSignUp: true }
  }

  // window sudah lewat → reset counter
  if (existing.resetAt <= now) {
    await prisma.signThrottle.update({
      where: { ip },
      data: { count: 1, resetAt }
    })
    return { canSignUp: true }
  }

  if (existing.count >= 5) {
    return { canSignUp: false, message: "Terlalu banyak percobaan, coba lagi nanti" }
  }

  await prisma.signThrottle.update({
    where: { ip },
    data: { count: existing.count + 1 }
  })

  return { canSignUp: true }
}

export async function recordLoginAttempt(
  userId: string,
  success: boolean,
  ip?: string
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { userId, success, ip: ip || null }
  })
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  // Lockout 15 menit jika >= 5 percobaan gagal berurutan dalam window
  const now = new Date()
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000)

  const failures = await prisma.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: { gt: windowStart }
    }
  })

  return failures >= 5
}




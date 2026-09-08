import { describe, it, expect } from "vitest"
import { hashPassword, comparePassword, generateToken } from "../helpers"

describe("Password Helpers", () => {
  it("should hash and compare password correctly", async () => {
    const password = "testpassword123"
    const hashed = await hashPassword(password)
    
    expect(hashed).not.toBe(password)
    expect(hashed.length).toBeGreaterThan(50)
    
    const isValid = await comparePassword(password, hashed)
    expect(isValid).toBe(true)
    
    const isInvalid = await comparePassword("wrongpassword", hashed)
    expect(isInvalid).toBe(false)
  })

  it("should generate random tokens", () => {
    const token1 = generateToken()
    const token2 = generateToken()
    
    expect(token1).not.toBe(token2)
    expect(token1.length).toBe(64)
  })
})


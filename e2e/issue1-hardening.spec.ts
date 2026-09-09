import { test, expect } from "@playwright/test"

const ip = () => `203.0.113.${Math.floor(Math.random() * 200 + 1)}`

test.describe("Issue #1 hardening — validation, guards, throttle", () => {
  test("signup rejects invalid email and short password with 400", async ({ page }) => {
    const badEmail = await page.request.post("/api/auth/signup", {
      data: { email: "bukan-email", password: "Password123" },
      headers: { "x-forwarded-for": ip() },
    })
    expect(badEmail.status()).toBe(400)

    const shortPass = await page.request.post("/api/auth/signup", {
      data: { email: `pendek-${Date.now()}@example.com`, password: "pendek" },
      headers: { "x-forwarded-for": ip() },
    })
    expect(shortPass.status()).toBe(400)
  })

  test("verify-email rejects missing and bogus token with 400", async ({ page }) => {
    const missing = await page.request.get("/api/auth/verify-email")
    expect(missing.status()).toBe(400)

    const bogus = await page.request.get("/api/auth/verify-email?token=token-ngawur-123")
    expect(bogus.status()).toBe(400)
  })

  test("reset-password rejects bogus token and short password with 400", async ({ page }) => {
    const email = `h1reset-${Date.now()}@example.com`
    const testIp = ip()
    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: "OldPassword123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(su.status()).toBe(201)
    const s = await su.json()
    await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)
    const fg = await page.request.post("/api/auth/forgot-password", {
      data: { email },
      headers: { "x-forwarded-for": testIp },
    })
    const validToken = (await fg.json()).resetToken
    expect(validToken).toBeTruthy()

    const bogus = await page.request.post("/api/auth/reset-password", {
      data: { token: "token-ngawur-123", password: "NewPassword456" },
    })
    expect(bogus.status()).toBe(400)

    const short = await page.request.post("/api/auth/reset-password", {
      data: { token: validToken, password: "pendek" },
    })
    expect(short.status()).toBe(400)
  })

  test("forgot-password rejects unknown email (404) and empty email (400)", async ({ page }) => {
    const unknown = await page.request.post("/api/auth/forgot-password", {
      data: { email: `tak-ada-${Date.now()}@example.com` },
      headers: { "x-forwarded-for": ip() },
    })
    expect(unknown.status()).toBe(404)

    const empty = await page.request.post("/api/auth/forgot-password", {
      data: {},
      headers: { "x-forwarded-for": ip() },
    })
    expect(empty.status()).toBe(400)
  })

  test("resend-verification: unknown 404, verified 400, unverified 200", async ({ page }) => {
    const unknown = await page.request.post("/api/auth/resend-verification", {
      data: { email: `tak-ada-${Date.now()}@example.com` },
      headers: { "x-forwarded-for": ip() },
    })
    expect(unknown.status()).toBe(404)

    const verified = await page.request.post("/api/auth/resend-verification", {
      data: { email: "admin@example.com" },
      headers: { "x-forwarded-for": ip() },
    })
    expect(verified.status()).toBe(400)

    const email = `h1resend-${Date.now()}@example.com`
    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: "Password123" },
      headers: { "x-forwarded-for": ip() },
    })
    expect(su.status()).toBe(201)
    const again = await page.request.post("/api/auth/resend-verification", {
      data: { email },
      headers: { "x-forwarded-for": ip() },
    })
    expect(again.status()).toBe(200)
  })

  test("API guards return 401 without session", async ({ page }) => {
    for (const url of ["/api/invitations", "/api/templates", "/api/invitations/id-ngawur"]) {
      const res = await page.request.get(url)
      expect(res.status()).toBe(401)
    }
  })

  test("signup throttle returns 429 after 5 attempts from one IP", async ({ page }) => {
    const testIp = `198.51.100.${Math.floor(Math.random() * 200 + 1)}`
    const stamp = Date.now()
    for (let i = 0; i < 5; i++) {
      const res = await page.request.post("/api/auth/signup", {
        data: { email: `throttle-${stamp}-${i}@example.com`, password: "Password123" },
        headers: { "x-forwarded-for": testIp },
      })
      expect(res.status()).toBe(201)
    }
    const blocked = await page.request.post("/api/auth/signup", {
      data: { email: `throttle-${stamp}-6@example.com`, password: "Password123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(blocked.status()).toBe(429)
  })

  test("sign-up UI shows success status on valid registration", async ({ page }) => {
    const email = `h1ui-${Date.now()}@example.com`
    const testIp = ip()
    await page.route("**/api/auth/signup", (route) =>
      route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": testIp } }),
    )
    await page.goto("/sign-up")
    await page.fill("#email", email)
    await page.fill("#password", "Password123")
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="status"]')).toContainText("Akun berhasil dibuat", { timeout: 8000 })
  })
})

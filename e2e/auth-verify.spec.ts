import { test, expect, Page } from "@playwright/test"

test.describe("Auth end-to-end (Issue #1) — full flows", () => {
  const ip = () => `203.0.113.${Math.floor(Math.random() * 200 + 1)}` // header test unik

  test("signup → unverified blocked → verify email → sign in → dashboard", async ({ page }) => {
    const email = `full-${Date.now()}@example.com`
    const password = "Str0ngPass123"
    const testIp = ip()

    const res = await page.request.post("/api/auth/signup", {
      data: { email, password },
      headers: { "x-forwarded-for": testIp },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    const token = body.verificationToken
    expect(token).toBeTruthy()

    await page.goto("/sign-in")
    await page.fill("#email", email)
    await page.fill("#password", password)
    await page.click("button[type=submit]")
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 })

    const ver = await page.request.get(`/api/auth/verify-email?token=${token}`)
    expect(ver.status()).toBe(200)

    await page.fill("#email", email)
    await page.fill("#password", password)
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()
  })

  test("forgot-password request succeeds and page shows confirmation", async ({ page }) => {
    const email = `forgot-${Date.now()}@example.com`
    const testIp = ip()
    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: "OldPassword123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(su.status()).toBe(201)
    const s = await su.json()
    await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)

    await page.goto("/forgot-password")
    await page.fill("#email", email)
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 8000 })

    const forgot = await page.request.post("/api/auth/forgot-password", {
      data: { email },
      headers: { "x-forwarded-for": testIp },
    })
    expect(forgot.status()).toBe(200)
  })

  test("duplicate signup email returns 409", async ({ page }) => {
    const email = `dup-${Date.now()}@example.com`
    const testIp = ip()
    const res1 = await page.request.post("/api/auth/signup", {
      data: { email, password: "Password123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(res1.status()).toBe(201)
    const res2 = await page.request.post("/api/auth/signup", {
      data: { email, password: "Password123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(res2.status()).toBe(409)
  })
})

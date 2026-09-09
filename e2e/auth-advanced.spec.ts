import { test, expect, Page } from "@playwright/test"

const ip = () => `203.0.113.${Math.floor(Math.random() * 200 + 1)}`

test.describe("Auth advanced flows (Issue #1)", () => {
  test("forgot → reset password → login with new password", async ({ page }) => {
    const email = `resetfull-${Date.now()}@example.com`
    const oldPass = "OldPassword123"
    const newPass = "NewPassword456"
    const testIp = ip()

    // signup + verify
    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: oldPass },
      headers: { "x-forwarded-for": testIp },
    })
    const s = await su.json()
    await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)

    // forgot → ambil resetToken (dev mode)
    const fg = await page.request.post("/api/auth/forgot-password", {
      data: { email },
      headers: { "x-forwarded-for": testIp },
    })
    expect(fg.status()).toBe(200)
    const f = await fg.json()
    expect(f.resetToken).toBeTruthy()
    const resetToken = f.resetToken

    // buka halaman reset dengan token di query
    await page.goto(`/reset-password?token=${resetToken}`)
    await page.fill("#password", newPass)
    await page.fill("#confirmPassword", newPass)
    await page.click('button[type="submit"]')
    // sukses → pesan muncul
    await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 8000 })

    // login dengan password baru → sukses
    await page.goto("/sign-in")
    await page.fill("#email", email)
    await page.fill("#password", newPass)
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()
  })

  test("old password no longer works after reset", async ({ page }) => {
    const email = `resetold-${Date.now()}@example.com`
    const oldPass = "OldPassword123"
    const newPass = "NewPassword456"
    const testIp = ip()

    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: oldPass },
      headers: { "x-forwarded-for": testIp },
    })
    const s = await su.json()
    await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)

    const fg = await page.request.post("/api/auth/forgot-password", {
      data: { email },
      headers: { "x-forwarded-for": testIp },
    })
    const f = await fg.json()
    const res = await page.request.post("/api/auth/reset-password", {
      data: { token: f.resetToken, password: newPass },
    })
    expect(res.status()).toBe(200)

    // login pakai password lama → harus ditolak
    await page.goto("/sign-in")
    await page.fill("#email", email)
    await page.fill("#password", oldPass)
    await page.click("button[type=submit]")
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 })
  })
})

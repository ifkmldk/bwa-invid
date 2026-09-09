import { test, expect, Page } from "@playwright/test"

test.describe("Login lockout (Issue #1)", () => {
  test("5 failed logins lock the account for a fresh user", async ({ page }) => {
    const email = `lock-${Date.now()}@example.com`
    const realPass = "CorrectPass123"
    const testIp = `192.0.2.${Math.floor(Math.random() * 200 + 1)}`

    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: realPass },
      headers: { "x-forwarded-for": testIp },
    })
    expect(su.status()).toBe(201)
    const s = await su.json()
    const ver = await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)
    expect(ver.status()).toBe(200)

    // 5x login gagal
    await page.goto("/sign-in")
    for (let i = 0; i < 5; i++) {
      await page.fill("#email", email)
      await page.fill("#password", "wrongpass")
      await page.click("button[type=submit]")
      await expect(page.locator('[role="alert"]').filter({ hasText: /salah|verifikasi|dikunci/i })).toBeVisible({ timeout: 8000 })
    }

    // ke-6 dengan password BENAR → tetap ditolak karena terkunci
    await page.fill("#email", email)
    await page.fill("#password", realPass)
    await page.click("button[type=submit]")
    const lockAlert = page.locator('[role="alert"]').filter({ hasText: "Akun dikunci" })
    await expect(lockAlert).toBeVisible({ timeout: 8000 })
  })
})

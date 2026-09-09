import { test, expect, Page } from "@playwright/test"

test.describe("Mobile + access control", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("mobile: sidebar hidden, hamburger opens it, heading visible", async ({ page }) => {
    await page.goto("/sign-in")
    await page.fill("#email", "admin@example.com")
    await page.fill("#password", "admin123")
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)

    // heading visible (tidak tertutup top menu)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()

    // hamburger visible via css selector
    const hamburger = page.locator('button[aria-label="Buka menu"]')
    await expect(hamburger).toBeVisible()

    // sidebar tersembunyi (translated off-canvas)
    const aside = page.locator("aside")
    await expect(aside).not.toBeInViewport()

    // buka menu
    await hamburger.click()
    await expect(aside).toBeInViewport()
    await expect(page.getByText("Undanganku").first()).toBeVisible()
  })

  test("regular user can sign in and reach dashboard", async ({ page }) => {
    const email = `guard-${Date.now()}@example.com`
    const testIp = `203.0.113.${Math.floor(Math.random() * 200 + 1)}`
    const su = await page.request.post("/api/auth/signup", {
      data: { email, password: "Password123" },
      headers: { "x-forwarded-for": testIp },
    })
    expect(su.status()).toBe(201)
    const s = await su.json()
    await page.request.get(`/api/auth/verify-email?token=${s.verificationToken}`)

    await page.goto("/sign-in")
    await page.fill("#email", email)
    await page.fill("#password", "Password123")
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()
  })
})

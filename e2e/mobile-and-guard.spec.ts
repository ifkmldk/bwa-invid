import { test, expect, Page } from "@playwright/test"

test.describe("Mobile + access control", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("mobile: hamburger opens sidebar without overlapping logo", async ({ page }) => {
    await page.goto("/sign-in")
    await page.fill("#email", "admin@example.com")
    await page.fill("#password", "admin123")
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)

    // heading konten visible
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()

    const hamburger = page.locator("button[aria-label=\"Buka menu\"]")
    await expect(hamburger).toBeVisible()

    // sidebar hidden awal
    await expect(page.locator("aside")).not.toBeInViewport()

    // buka menu
    await hamburger.click()
    const aside = page.locator("aside")
    await expect(aside).toBeInViewport()

    // logo "Undanganku" di sidebar terlihat & tidak tertutup (hamburger disembunyikan saat terbuka)
    await expect(page.getByText("Undanganku").first()).toBeVisible()
    // hamburger menghilang saat sidebar terbuka (supaya tidak menutupi logo)
    await expect(hamburger).not.toBeVisible()

    // tombol tutup ada
    await expect(page.getByRole("button", { name: "Tutup menu" })).toBeVisible()
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

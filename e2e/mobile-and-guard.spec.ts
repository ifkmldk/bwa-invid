import { test, expect } from "@playwright/test"

test.describe("Mobile + access control", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("mobile: hamburger opens sidebar without blink (stays mounted, fades via opacity)", async ({ page }) => {
    await page.goto("/sign-in")
    await page.fill("#email", "admin@example.com")
    await page.fill("#password", "admin123")
    await Promise.all([
      page.waitForURL(/.*dashboard/, { timeout: 15000 }),
      page.click("button[type=submit]"),
    ])
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()

    const hamburger = page.getByTestId("hamburger")
    const backdrop = page.getByTestId("sidebar-backdrop")
    const close = page.getByTestId("sidebar-close")
    const aside = page.getByTestId("sidebar")

    // Semua kontrol selalu di DOM (anti-blink). Playwright menganggap opacity-0
    // tetap "visible", jadi state dibuktikan lewat class + aria-hidden.
    await expect(hamburger).toBeAttached()
    await expect(backdrop).toBeAttached()
    await expect(close).toBeAttached()

    // Keadaan tertutup
    await expect(aside).not.toBeInViewport()
    await expect(hamburger).toHaveClass(/opacity-100/)
    await expect(hamburger).toHaveAttribute("aria-hidden", "false")
    await expect(backdrop).toHaveClass(/opacity-0/)
    await expect(backdrop).toHaveAttribute("aria-hidden", "true")
    await expect(close).toHaveClass(/opacity-0/)
    await expect(close).toHaveAttribute("aria-hidden", "true")

    // Buka menu
    await hamburger.click()
    await expect(aside).toBeInViewport()

    // Hamburger memudar tanpa unmount (tanpa layout shift); logo tidak tertutup
    await expect(hamburger).toHaveClass(/opacity-0/)
    await expect(hamburger).toHaveAttribute("aria-hidden", "true")
    await expect(page.getByText("Undanganku").first()).toBeVisible()
    await expect(backdrop).toHaveClass(/opacity-100/)
    await expect(backdrop).toHaveAttribute("aria-hidden", "false")
    await expect(close).toHaveClass(/opacity-100/)
    await expect(close).toBeVisible()

    // Tutup via tombol close
    await close.click()
    await expect(aside).not.toBeInViewport()
    await expect(hamburger).toHaveClass(/opacity-100/)
    await expect(backdrop).toHaveClass(/opacity-0/)

    // Buka lagi, tutup via backdrop
    await hamburger.click()
    await expect(aside).toBeInViewport()
    await backdrop.click()
    await expect(aside).not.toBeInViewport()
    await expect(hamburger).toHaveClass(/opacity-100/)
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

  test("guest hitting /dashboard/templates is sent to sign-in", async ({ page }) => {
    await page.goto("/dashboard/templates")
    await expect(page).toHaveURL(/.*sign-in/, { timeout: 10000 })
  })
})

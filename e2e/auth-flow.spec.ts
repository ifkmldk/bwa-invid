import { test, expect, Page } from "@playwright/test"

async function login(page: Page, email = "admin@example.com", password = "admin123") {
  await page.goto("/sign-in")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 15000 }),
    page.click("button[type=submit]"),
  ])
}

test.describe("Auth Flow (Issue #1)", () => {
  test("root redirects to sign-in when logged out", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/.*sign-in/)
  })

  test("sign-in page renders", async ({ page }) => {
    await page.goto("/sign-in")
    await expect(page.getByRole("heading", { name: "Undanganku" })).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
    await expect(page.locator("button[type=submit]")).toContainText("Masuk")
  })

  test("sign-up page renders", async ({ page }) => {
    await page.goto("/sign-up")
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
  })

  test("forgot-password page renders", async ({ page }) => {
    await page.goto("/forgot-password")
    await expect(page.getByRole("heading", { name: "Lupa Kata Sandi" })).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
  })

  test("admin can sign in and reach dashboard", async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()
  })

  test("unauthenticated cannot access dashboard", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/.*sign-in/)
  })

  test("sign-in rejects wrong password with explicit error", async ({ page }) => {
    await page.goto("/sign-in")
    await page.fill("#email", "admin@example.com")
    await page.fill("#password", "wrong-password")
    await page.click("button[type=submit]")
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 })
  })

  test("sign-out returns to sign-in", async ({ page }) => {
    await login(page)
    await page.getByRole("button", { name: "Keluar" }).click()
    await expect(page).toHaveURL(/.*sign-in/, { timeout: 10000 })
  })
})

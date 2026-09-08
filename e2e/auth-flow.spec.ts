import { test, expect } from "@playwright/test"

test.describe("Auth Flow", () => {
  test("should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/.*sign-in/)
  })

  test("should show sign-up page", async ({ page }) => {
    await page.goto("/sign-up")
    await expect(page.locator("h1")).toContainText("Buat Akun Baru")
  })

  test("should show sign-in page", async ({ page }) => {
    await page.goto("/sign-in")
    await expect(page.locator("h1")).toContainText("Masuk")
  })
})


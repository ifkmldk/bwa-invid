import { test, expect, Page } from "@playwright/test"

async function login(page: Page) {
  await page.goto("/sign-in")
  await page.fill("#email", "admin@example.com")
  await page.fill("#password", "admin123")
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 15000 }),
    page.click("button[type=submit]"),
  ])
}

test.describe("Draft resume (Issue #2)", () => {
  test("draft persists groom name after leaving and returning", async ({ page }) => {
    await login(page)

    await page.goto("/dashboard/templates")
    await expect(page.getByRole("button", { name: /Elegant Modern/i }).first()).toBeVisible({ timeout: 15000 })
    await page.getByRole("button", { name: /Elegant Modern/i }).first().click()
    await page.getByRole("button", { name: "Gunakan Template Ini" }).click()
    await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })
    const id = page.url().split("/").pop()

    // field pertama = nama mempelai pria (groom)
    const groomInput = page.getByRole("textbox", { name: "Nama Mempelai Pria" }).or(page.locator('input[placeholder="Nama lengkap"]').first())
    await groomInput.fill("Siti")

    await expect
      .poll(async () => {
        const res = await page.request.get(`/api/invitations/${id}`)
        if (!res.ok()) return null
        const d = await res.json()
        return d.invitation?.groomName
      }, { timeout: 15000 })
      .toBe("Siti")

    // keluar ke dashboard
    await page.getByRole("link", { name: "Dashboard" }).first().click()
    await expect(page).toHaveURL(/.*dashboard/)

    // buka lagi via kartu
    await page.getByText("Elegant Modern").first().click()
    await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })

    // groom name ter-restore (field pertama)
    await expect(page.locator('input[placeholder="Nama lengkap"]').first()).toHaveValue("Siti", { timeout: 8000 })
  })
})

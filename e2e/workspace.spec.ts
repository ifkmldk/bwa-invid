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

async function createInvitation(page: Page, templateName: string) {
  await page.goto("/dashboard/templates")
  await expect(page.getByRole("button", { name: new RegExp(templateName, "i") }).first()).toBeVisible({ timeout: 15000 })
  await page.getByRole("button", { name: new RegExp(templateName, "i") }).first().click()
  await page.getByRole("button", { name: "Gunakan Template Ini" }).click()
  await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })
  return page.url().split("/").pop()!
}

test.describe("Invitation Workspace (Issue #2)", () => {
  test("template browser loads categories and cards", async ({ page }) => {
    await login(page)
    await page.goto("/dashboard/templates")
    await expect(page.getByRole("heading", { name: "Pilih Template" })).toBeVisible()
    for (const cat of ["Modern", "Traditional", "Minimalist", "Luxury", "Islamic"]) {
      await expect(page.getByRole("button", { name: cat })).toBeVisible()
    }
    await expect(page.getByRole("button", { name: /Elegant Modern/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test("template modal preview and create draft", async ({ page }) => {
    await login(page)
    await page.goto("/dashboard/templates")
    await page.getByRole("button", { name: /Elegant Modern/i }).first().click()
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 8000 })
    await page.getByRole("button", { name: "Gunakan Template Ini" }).click()
    await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })
  })

  test("wizard renders 6 steps and navigates", async ({ page }) => {
    await login(page)
    await page.goto("/dashboard/templates")
    await page.getByRole("button", { name: /Classic Traditional/i }).first().click()
    await page.getByRole("button", { name: "Gunakan Template Ini" }).click()
    await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })
    for (const label of ["Data Pasangan", "Detail Acara", "Galeri", "Cerita Cinta", "Hadiah", "Pengaturan"]) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
    await page.getByRole("button", { name: "Selanjutnya" }).click()
    await expect(page.getByRole("heading", { name: "Detail Acara" })).toBeVisible()
  })

  test("couple step fills and live preview updates", async ({ page }) => {
    await login(page)
    await page.goto("/dashboard/templates")
    await page.getByRole("button", { name: /Clean Minimalist/i }).first().click()
    await page.getByRole("button", { name: "Gunakan Template Ini" }).click()
    await expect(page).toHaveURL(/.*dashboard\/invitations\//, { timeout: 10000 })
    await page.fill('input[placeholder="Nama lengkap"]', "Budi")
    await expect(page.getByText("Budi").first()).toBeVisible({ timeout: 8000 })
  })

  test("autosave persists groom name to server", async ({ page }) => {
    // login dan buat invitation via UI (dengan tunggu card)
    await login(page)
    const id = await createInvitation(page, "Elegant Modern")
    await page.fill('input[placeholder="Nama lengkap"]', "Reyna")
    await expect
      .poll(async () => {
        const res = await page.request.get(`/api/invitations/${id}`)
        if (!res.ok()) return null
        const data = await res.json()
        return data.invitation?.groomName
      }, { timeout: 15000 })
      .toBe("Reyna")
  })

  test("dashboard lists created invitation card", async ({ page }) => {
    await login(page)
    await createInvitation(page, "Elegant Modern")
    await page.getByRole("link", { name: "Dashboard" }).first().click()
    await expect(page.getByRole("heading", { name: "Undangan Saya" })).toBeVisible()
    await expect(page.getByText("Elegant Modern").first()).toBeVisible({ timeout: 8000 })
  })
})

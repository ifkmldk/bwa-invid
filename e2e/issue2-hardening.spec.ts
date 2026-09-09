import { test, expect, Page, APIRequestContext } from "@playwright/test"

async function createVerifiedUser(request: APIRequestContext, tag: string) {
  const email = `i2-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
  const password = "Password123"
  const testIp = `203.0.113.${Math.floor(Math.random() * 200 + 1)}`
  const su = await request.post("/api/auth/signup", {
    data: { email, password },
    headers: { "x-forwarded-for": testIp },
  })
  expect(su.status()).toBe(201)
  const s = await su.json()
  const ver = await request.get(`/api/auth/verify-email?token=${s.verificationToken}`)
  expect(ver.status()).toBe(200)
  return { email, password }
}

async function uiLogin(page: Page, email: string, password: string) {
  await page.goto("/sign-in")
  await page.fill("#email", email)
  await page.fill("#password", password)
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 15000 }),
    page.click("button[type=submit]"),
  ])
}

async function templateIdByName(request: APIRequestContext, name: string) {
  const res = await request.get("/api/templates")
  expect(res.status()).toBe(200)
  const body = await res.json()
  const t = (body.templates as any[]).find((x) => x.name === name)
  expect(t, `template ${name} harus ada di seed`).toBeTruthy()
  return t.id as string
}

async function createInvitation(request: APIRequestContext, tid: string) {
  const res = await request.post("/api/invitations", { data: { templateId: tid } })
  expect(res.status()).toBe(201)
  return (await res.json()).invitation.id as string
}

test.describe("Issue #2 hardening — draft builder", () => {
  test("template catalog filter narrows grid by category", async ({ page }) => {
    await uiLogin(page, "admin@example.com", "admin123")
    await page.goto("/dashboard/templates")
    await expect(page.getByRole("button", { name: /Elegant Modern/i }).first()).toBeVisible({ timeout: 15000 })

    // API: filter kategori hanya mengembalikan kategori itu
    const modern = await page.request.get("/api/templates?category=Modern")
    expect(modern.status()).toBe(200)
    const names = ((await modern.json()).templates as any[]).map((t) => t.name)
    expect(names).toContain("Elegant Modern")
    expect(names).not.toContain("Classic Traditional")

    // UI: tab Modern menyembunyikan template kategori lain, tab Semua mengembalikan
    await page.getByRole("button", { name: "Modern", exact: true }).click()
    await expect(page.getByRole("button", { name: /Elegant Modern/i }).first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole("button", { name: /Classic Traditional/i })).toHaveCount(0)
    await page.getByRole("button", { name: "Semua", exact: true }).click()
    await expect(page.getByRole("button", { name: /Classic Traditional/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test("wizard walks all 6 steps forward and back", async ({ page }) => {
    const user = await createVerifiedUser(page.request, "wiz")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)

    await page.goto(`/dashboard/invitations/${id}`)
    for (const label of ["Data Pasangan", "Detail Acara", "Galeri", "Cerita Cinta", "Hadiah", "Pengaturan"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 8000 })
    }
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Selanjutnya" }).click()
    }
    await expect(page.getByRole("link", { name: "Simpan & Kembali" })).toBeVisible({ timeout: 8000 })
    await page.getByRole("button", { name: "Sebelumnya" }).click()
    await expect(page.getByRole("button", { name: "Selanjutnya" })).toBeVisible({ timeout: 8000 })
  })

  test("KNOWN GAP: wizard advances with empty fields (no per-step validation)", async ({ page }) => {
    // Acceptance Issue #2 menuntut tiap step memvalidasi input sebelum lanjut.
    // Test ini mendokumentasikan perilaku saat ini: kosong pun bisa maju 5 step.
    // Kalau validasi sudah dipasang, test ini HARUS merah — hapus/perbarui saat itu.
    const user = await createVerifiedUser(page.request, "noval")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)

    await page.goto(`/dashboard/invitations/${id}`)
    await expect(page.getByText("Data Pasangan", { exact: true }).first()).toBeVisible({ timeout: 8000 })
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Selanjutnya" }).click()
    }
    await expect(page.getByRole("link", { name: "Simpan & Kembali" })).toBeVisible({ timeout: 8000 })
  })

  test("draft persists bride, events, loveStory, gifts via PATCH", async ({ page }) => {
    const user = await createVerifiedUser(page.request, "patch")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)

    const patch = await page.request.patch(`/api/invitations/${id}`, {
      data: {
        brideName: "Anisa",
        groomName: "Budi",
        loveStory: [{ date: "2020-01-01", description: "Pertemuan pertama" }],
        gifts: [{ bankName: "BCA", accountNumber: "123456", accountName: "Budi" }],
        events: [
          {
            title: "Akad Nikah",
            date: "2026-12-12T00:00:00.000Z",
            timeStart: "2026-12-12T08:00:00.000Z",
            location: "Gedung Serbaguna",
            address: "Jl. Mawar 1",
          },
        ],
      },
    })
    expect(patch.status()).toBe(200)

    const got = await page.request.get(`/api/invitations/${id}`)
    expect(got.status()).toBe(200)
    const inv = (await got.json()).invitation
    expect(inv.brideName).toBe("Anisa")
    expect(inv.groomName).toBe("Budi")
    expect(inv.event?.[0]?.title).toBe("Akad Nikah")
    expect(JSON.stringify(inv.loveStory)).toContain("Pertemuan pertama")
    expect(JSON.stringify(inv.gifts)).toContain("BCA")
  })

  test("invitations are isolated between users", async ({ page, browser }) => {
    // Kedua user dibuat selagi masih logged-out: POST signup menolak (400) kalau request membawa sesi aktif.
    const userA = await createVerifiedUser(page.request, "isoA")
    const userB = await createVerifiedUser(page.request, "isoB")
    await uiLogin(page, userA.email, userA.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const idA = await createInvitation(page.request, tid)

    const ctxB = await browser.newContext()
    const pageB = await ctxB.newPage()
    try {
      await uiLogin(pageB, userB.email, userB.password)
      const other = await pageB.request.get(`/api/invitations/${idA}`)
      expect(other.status()).toBe(404)
      const list = await pageB.request.get("/api/invitations")
      const ids = ((await list.json()).invitations as any[]).map((x) => x.id)
      expect(ids).not.toContain(idA)
    } finally {
      await ctxB.close()
    }
  })

  test("POST /api/invitations validates templateId", async ({ page }) => {
    const user = await createVerifiedUser(page.request, "tid")
    await uiLogin(page, user.email, user.password)

    const missing = await page.request.post("/api/invitations", { data: {} })
    expect(missing.status()).toBe(400)

    const bogus = await page.request.post("/api/invitations", { data: { templateId: "template-ngawur" } })
    expect(bogus.status()).toBe(404)
  })

  test("PATCH /api/invitations/:id without session returns 401", async ({ page }) => {
    const res = await page.request.patch("/api/invitations/id-ngawur", { data: { brideName: "X" } })
    expect(res.status()).toBe(401)
  })
})


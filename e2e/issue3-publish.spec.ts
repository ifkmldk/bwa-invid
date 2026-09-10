import { test, expect, Page, APIRequestContext } from "@playwright/test"

async function createVerifiedUser(request: APIRequestContext, tag: string) {
  const email = `i3-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
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

async function fillCoupleAndEvent(request: APIRequestContext, id: string, groom = "Budi", bride = "Anisa") {
  const res = await request.patch(`/api/invitations/${id}`, {
    data: {
      groomName: groom,
      brideName: bride,
      events: [
        {
          title: "Akad Nikah",
          date: "2026-12-12",
          location: "Gedung Serbaguna",
          address: "Jl. Mawar No. 1, Jakarta",
          mapsUrl: "https://maps.google.com/?q=gedung+serbaguna",
        },
      ],
    },
  })
  expect(res.status()).toBe(200)
}

test.describe("Issue #3 — publish & public runtime", () => {
  test("publish butuh data lengkap (422) lalu sukses dan publik bisa diakses tanpa login", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "pub")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)

    const empty = await page.request.post(`/api/invitations/${id}/publish`)
    expect(empty.status()).toBe(422)

    await fillCoupleAndEvent(page.request, id)
    const pub = await page.request.post(`/api/invitations/${id}/publish`)
    expect(pub.status()).toBe(200)
    const slug = (await pub.json()).invitation.slug as string
    expect(slug).not.toMatch(/^draft-/)
    expect(slug).toContain("budi")

    // publik tanpa login: request fixture standalone tidak bawa cookie sesi
    const pubPage = await request.get(`/u/${slug}`)
    expect(pubPage.status()).toBe(200)
    const html = await pubPage.text()
    expect(html).toContain("Budi")
    expect(html).toContain("Anisa")
    expect(html).toContain("Akad Nikah")
    expect(html).toContain("Buka Peta")
    expect(html).toContain("Google Calendar")
    expect(html).toContain("data-testid=\"countdown\"")
    expect(html).toContain("Budi &amp; Anisa — Undangan Pernikahan")

    await page.goto(`/u/${slug}`)
    await expect(page.getByTestId("public-names")).toContainText("Budi")
    await expect(page.getByTestId("countdown")).toBeVisible()
    await expect(page.getByTestId("event-maps").first()).toHaveAttribute("href", /maps\.google\.com/)
    const gcal = await page.getByTestId("calendar-google").first().getAttribute("href")
    expect(gcal).toContain("calendar.google.com")
    const ics = await page.getByTestId("calendar-ics").first().getAttribute("href")
    expect(ics).toContain("data:text/calendar")
  })

  test("slug tetap unik saat nama pasangan sama", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "slug")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const a = await createInvitation(page.request, tid)
    const b = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, a, "Rizky", "Putri")
    await fillCoupleAndEvent(page.request, b, "Rizky", "Putri")

    const ra = await page.request.post(`/api/invitations/${a}/publish`)
    const rb = await page.request.post(`/api/invitations/${b}/publish`)
    expect(ra.status()).toBe(200)
    expect(rb.status()).toBe(200)
    const sa = (await ra.json()).invitation.slug as string
    const sb = (await rb.json()).invitation.slug as string
    expect(sa).not.toBe(sb)
    expect(sa).toContain("rizky-putri")
    expect(sb).toContain("rizky-putri")

    expect((await request.get(`/u/${sa}`)).status()).toBe(200)
    expect((await request.get(`/u/${sb}`)).status()).toBe(200)
  })

  test("unpublish membuat halaman publik 404", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "unpub")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, id, "Dimas", "Sari")

    const pub = await page.request.post(`/api/invitations/${id}/publish`)
    const slug = (await pub.json()).invitation.slug as string
    expect((await request.get(`/u/${slug}`)).status()).toBe(200)

    const unpub = await page.request.post(`/api/invitations/${id}/unpublish`)
    expect(unpub.status()).toBe(200)
    expect((await unpub.json()).invitation.status).toBe("UNPUBLISHED")
    expect((await request.get(`/u/${slug}`)).status()).toBe(404)

    const repub = await page.request.post(`/api/invitations/${id}/publish`)
    expect(repub.status()).toBe(200)
    const slug2 = (await repub.json()).invitation.slug as string
    expect(slug2).toBe(slug)
    expect((await request.get(`/u/${slug}`)).status()).toBe(200)
  })

  test("guard: publish butuh login, PATCH tidak bisa override tema/status/slug", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "guard")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, id, "Fajar", "Nadia")

    const anon = await request.post(`/api/invitations/${id}/publish`)
    expect(anon.status()).toBe(401)
    const anonUn = await request.post(`/api/invitations/${id}/unpublish`)
    expect(anonUn.status()).toBe(401)
    expect((await request.get(`/u/draft-tidak-ada`)).status()).toBe(404)

    const evil = await page.request.patch(`/api/invitations/${id}`, {
      data: {
        groomName: "Fajar",
        themeConfig: { primaryColor: "#000000" },
        status: "PUBLISHED",
        slug: "slug-bajakan",
      },
    })
    expect(evil.status()).toBe(200)
    const after = (await evil.json()).invitation
    expect(after.themeConfig?.primaryColor).not.toBe("#000000")
    expect(after.status).toBe("DRAFT")
    expect(after.slug).not.toBe("slug-bajakan")
  })

  test("panel publish di settings: publish, copy-link, WA share", async ({ page, request }) => {
    test.slow()
    const user = await createVerifiedUser(request, "panel")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, id, "Yoga", "Tiara")

    await page.goto(`/dashboard/invitations/${id}`)
    await page.evaluate((invId: string) => {
      localStorage.setItem(`bwa-step-${invId}`, "5")
    }, id)
    await page.goto(`/dashboard/invitations/${id}`)
    await expect(page.getByTestId("publish-panel")).toBeVisible({ timeout: 10000 })
    await page.getByTestId("publish-button").click()
    await expect(page.getByTestId("public-link")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("publish-status")).toContainText("Published")
    await expect(page.getByTestId("copy-link")).toBeVisible()
    const wa = await page.getByTestId("wa-share").getAttribute("href")
    expect(wa).toContain("wa.me")
    expect(wa).toContain(encodeURIComponent((await page.getByTestId("public-link").textContent()) || "/u/").slice(0, 20))
  })

  test("paritas: public render sama dengan preview terkunci #2", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "parity")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Classic Traditional")
    const id = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, id, "Hendra", "Lestari")

    const pub = await page.request.post(`/api/invitations/${id}/publish`)
    const slug = (await pub.json()).invitation.slug as string

    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(`/dashboard/invitations/${id}`)
    const previewHeader = page.getByTestId("wizard-preview-header")
    await expect(previewHeader).toBeVisible({ timeout: 10000 })
    const previewBg = await previewHeader.evaluate((el) => getComputedStyle(el).backgroundColor)
    const previewFont = await page.getByTestId("wizard-preview-names").evaluate((el) => getComputedStyle(el).fontFamily)

    await page.goto(`/u/${slug}`)
    const publicHeader = page.getByTestId("public-header")
    await expect(publicHeader).toBeVisible()
    expect(await publicHeader.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(previewBg)
    expect(await page.getByTestId("public-names").evaluate((el) => getComputedStyle(el).fontFamily)).toBe(previewFont)
  })

  test("ucapan publik: kirim tanpa login lalu tampil di halaman", async ({ page, request }) => {
    const user = await createVerifiedUser(request, "wish")
    await uiLogin(page, user.email, user.password)
    const tid = await templateIdByName(page.request, "Elegant Modern")
    const id = await createInvitation(page.request, tid)
    await fillCoupleAndEvent(page.request, id, "Bagus", "Rani")

    const pub = await page.request.post(`/api/invitations/${id}/publish`)
    const slug = (await pub.json()).invitation.slug as string

    const bad = await request.post(`/api/u/${slug}/wishes`, { data: { name: "", message: "" } })
    expect(bad.status()).toBe(400)

    const ok = await request.post(`/api/u/${slug}/wishes`, {
      data: { name: "Tamu Spesial", message: "Selamat menempuh hidup baru!" },
    })
    expect(ok.status()).toBe(201)

    await page.goto(`/u/${slug}`)
    await expect(page.getByTestId("wish-list")).toContainText("Tamu Spesial")
    await expect(page.getByTestId("wish-list")).toContainText("Selamat menempuh hidup baru!")
  })
})

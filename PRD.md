# PRD: Undanganku - Platform Self-Service Undangan Digital Pernikahan

> Versi 1.0 | September 2026

---

## 1. Executive Summary

### Problem Statement
Calon pengantin di Indonesia menghabiskan Rp 500rb-5jt untuk undangan fisik, mengirim manual via WhatsApp, dan tidak punya cara rapi untuk mengumpulkan ucapan/souvenir digital. Proses ini boros waktu, tidak ramah lingkungan, dan tidak scalable untuk tamu lintas kota.

### Proposed Solution
Platform self-service di mana calon pengantin bisa daftar, pilih template, isi data, preview, dan publish undangan digital dengan URL unik (undanganku.com/nama-pasangan). Tamu menerima link via WhatsApp/SMS, melihat undangan di browser (tanpa install), dan bisa kirim ucapan langsung dari halaman.

### Success Criteria (MVP)
| KPI | Target |
|-----|--------|
| User terdaftar (12 bulan pertama) | >= 500 akun |
| Undangan aktif (published) | >= 30 |
| Conversion: signup -> published invitation | >= 15% |
| Conversion: checkout subscription | >= 5% |
| Guest wish submission rate | >= 30% dari tamu yang buka link |
| Page load time (public invitation) | <= 2 detik di 3G throttled |
| Lighthouse Performance (mobile) | >= 80 |

---

## 2. User Personas

### Persona 1: Rina (27 tahun) - Calon Pengantin
- Sibuk kerja, tidak punya waktu urus undangan fisik
- Ingin undangan yang Instagramable tapi practical
- Budget terbatas, cari yang bisa self-service tanpa koordinasi vendor
- Distribusi tamu tersebar (Jakarta, Bandung, kampung halaman)
- Butuh: pilih template -> isi data -> bayar -> kirim link -> terima ucapan

### Persona 2: Andi (29 tahun) - Calon Pengantin Tech-Savvy
- Ingin kontrol penuh atas tampilan undangan
- Mau tambah galeri foto, love story, countdown timer
- Aktif di WhatsApp, mau link yang bisa langsung share
- Butuh: semua fitur Rina + galeri, countdown, info kado

### Persona 3: Budi - Tamu Undangan
- Terima link via WhatsApp
- Buka di HP tanpa install app
- Mau lihat detail acara, RSVP, kirim ucapan
- Harus: buka link -> lihat undangan -> kirim wish dalam <= 3 langkah

### Persona 4: Admin Platform
- Kelola template, kategori, subscription plans
- Monitor user activity, payment status
- Tangani support ticket

---

### Product Principles

- **Anti AI SLOP**: Semua copy publik, placeholder, dan template default harus terasa manusiawi, spesifik, dan relevan untuk konteks pernikahan Indonesia; hindari filler generik, wording robotik, atau visual yang terasa asal jadi.
- **Seamless**: Alur signup -> pilih template -> isi data -> preview -> publish harus terasa seperti satu flow terpandu dengan autosave, progress yang jelas, dan minim pindah halaman yang tidak perlu.
- **Template integrity**: themeConfig setiap template terkunci dan tidak boleh dioverride end user.
- **Mobile-first public page**: Halaman undangan publik harus nyaman di HP terlebih dahulu, lalu tetap rapi di desktop.

## 3. User Stories & Acceptance Criteria

### Epic: Authentication

**US-01**: As a calon pengantin, I want to sign up with email & password so that I can create my account.
- AC:
  - Form: nama, email, password (min 8 char, 1 huruf besar, 1 angka)
  - Submit -> kirim verification email ke inbox user
  - Account tidak aktif sampai email diverifikasi
  - Error: email sudah terdaftar -> tampilkan pesan jelas, tawarkan "Sign In" atau "Forgot Password"
  - Rate limit: max 5 signup per IP per jam

**US-02**: As a user, I want to verify my email so that my account becomes active.
- AC:
  - Verification link via email (token valid 24 jam)
  - Klik link -> account aktif, redirect ke dashboard
  - Token expired -> tampilkan opsi kirim ulang

**US-03**: As a user, I want to sign in with email & password so that I can access my dashboard.
- AC:
  - Email salah / password salah -> error spesifik ("Email tidak ditemukan" / "Password salah")
  - Max 5 percobaan gagal -> lock 15 menit
  - Session aktif 30 hari, bisa "Remember me"
  - Redirect ke dashboard setelah login

**US-04**: As a user, I want to reset my password so that I can regain access if I forget.
- AC:
  - Klik "Forgot Password" -> masukkan email -> kirim reset link
  - Reset link valid 1 jam, single-use
  - Setelah reset -> redirect ke sign in dengan pesan sukses

---

### Epic: Subscription & Payment

**US-05**: As a new user, I want a free trial so that I can try the platform before paying.
- AC:
  - Setiap akun baru otomatis dapat Free tier
  - Free tier: 1 undangan aktif, semua template dasar, watermark kecil di bawah
  - Tidak perlu kartu kredit untuk trial
  - Watermark: "Powered by Undanganku" (small, bottom)

**US-06**: As a user, I want to upgrade subscription so that I can publish more undangan & remove watermark.
- AC:
  - 3 tier berbayar: Basic / Pro / Premium (lihat tabel pricing)
  - Checkout via Midtrans Snap (popup)
  - Setelah bayar -> subscription aktif, limit ter-update otomatis
  - Invoice tersimpan, bisa di-download

**US-07**: As a user, I want to see my current plan & limit so that I know what I can do.
- AC:
  - Dashboard menampilkan: plan aktif, jumlah undangan aktif, batas
  - Progress bar atau counter: "2 dari 3 undangan aktif"
  - Tombol "Upgrade" visible jika approaching limit

**Subscription Tiers:**

| | Free | Basic | Pro | Premium |
|---|---|---|---|---|
| Harga/bulan | Rp 0 | TBD | TBD | TBD |
| Undangan aktif | 1 | 3 | 10 | 30 |
| Template | Dasar saja | Dasar + Premium | Semua | Semua + Custom |
| Watermark | Ya | Tidak | Tidak | Tidak |
| Custom domain | Tidak | Tidak | Ya | Ya |
| Galeri foto | Maks 5 | Maks 20 | Unlimited | Unlimited |
| RSVP & Wall of Wishes | Dasar | Ya | Ya | Ya |

> Harga final belum ditetapkan; lihat section Pricing Strategy untuk draft hipotesis yang akan divalidasi.

---

### Epic: Invitation Management

**US-08**: As a user, I want to browse & pick a template so that I can start building my invitation.
- AC:
  - Katalog template di dashboard, filter per kategori (Modern, Traditional, Minimalist, Luxury, Islamic)
  - Setiap template: preview thumbnail, nama, kategori, status (Free/Pro/Premium)
  - Klik template -> preview full-screen -> pilih "Gunakan Template Ini"
  - Jika template Premium dan user Free/Basic -> upsell prompt

**US-09**: As a user, I want to fill in invitation data via a step-by-step form so that my invitation is complete.
- AC:
  - Wizard form (step-by-step), bukan 1 halaman panjang
  - Steps: Data Pasangan -> Detail Acara -> Galeri -> Cerita -> Hadiah -> Pengaturan
  - Auto-save setiap step (localStorage + server)
  - Validasi per step: data wajib harus terisi sebelum lanjut
  - Bisa skip step opsional (Galeri, Cerita, Hadiah)
  - Progress indicator di atas

**US-10**: As a user, I want to add multiple events (akad + resepsi) so that tamu tahu semua jadwal.
- AC:
  - Minimal 1 event wajib (judul, tanggal, waktu mulai, waktu selesai, lokasi/alamat, maps link)
  - Bisa tambah event kedua (akad) / ketiga
  - Setiap event: judul, tanggal, waktu, lokasi, embed Google Maps link
  - Urutan event ditampilkan berdasarkan tanggal

**US-11**: As a user, I want to add a photo gallery so that my invitation looks more personal.
- AC:
  - Upload foto (JPG/PNG/WebP, max 5MB per file)
  - Drag to reorder
  - Preview sebelum save
  - Limit sesuai tier (Free: 5, Basic: 20, Pro+: unlimited)
  - Stored di Supabase Storage, optimized otomatis (resize max 1200px wide)

**US-12**: As a user, I want to write our love story so that tamu bisa baca perjalanan hubungan kami.
- AC:
  - 3-5 milestone (tanggal + deskripsi singkat + foto opsional)
  - Timeline layout di template
  - Optional: bisa skip entirely

**US-13**: As a user, I want to add digital gift info so that tamu tahu cara kirim hadiah.
- AC:
  - Multi rekening bank (nama bank, no rekening, atas nama)
  - Alamat pengiriman (opsional)
  - Tampilkan sebagai card dengan tombol "Salin Rekening"

**US-14**: As a user, I want to publish my invitation so that I can share the link.
- AC:
  - Tombol "Publish" -> generate slug dari nama pasangan (contoh: rina-dan-andi)
  - Slug harus unique -> jika duplikat -> tambah angka (rina-dan-andi-1)
  - Setelah publish -> undangan aktif, link bisa di-share
  - Publikasi memerlukan: minimal 1 event terisi + nama pasangan terisi
  - Unpublish -> undangan offline, link tidak bisa diakses

**US-15**: As a user, I want to edit my published invitation so that I can update info jika ada perubahan.
- AC:
  - Edit tanpa harus unpublish
  - Perubahan langsung terlihat di link publik (real-time)
  - History edit (minimal 10 terakhir) bisa dilihat

---

### Epic: Public Invitation Page

**US-16**: As a guest, I want to open the invitation link and see the full invitation without installing anything.
- AC:
  - Buka link -> langsung render undangan di browser
  - Tidak perlu login, tidak perlu install app
  - Responsive: sempurna di mobile (primary), tablet, desktop
  - Load <= 2 detik di jaringan 3G (throttled)
  - SEO meta tags: title, description, og:image (foto cover pasangan)

**US-17**: As a guest, I want to see countdown to hari-H so that I know how many days left.
- AC:
  - Countdown timer (hari, jam, menit, detik)
  - Jika hari-H sudah lewat -> sembunyikan countdown, tampilkan "Acara telah dilaksanakan"
  - Countdown mengikuti timezone acara

**US-18**: As a guest, I want to submit a wish/ucapan so that the couple can read my message.
- AC:
  - Form: nama (wajib), ucapan (wajib)
  - Ucapan langsung muncul di Wall of Wishes (real-time via polling atau websocket)
  - Tidak perlu login
  - Rate limit: max 3 wish per IP per jam (anti spam)
  - Ucapan tersimpan: nama, teks, timestamp
  - Tombol "Kirim Ucapan" -> success toast

**US-19**: As a guest, I want to see other guests' wishes so that I feel the community.
- AC:
  - Wall of Wishes: daftar ucapan dengan nama, teks, waktu
  - Infinite scroll (load 20 per batch)
  - Sort: terbaru dulu (default)
  - Jumlah total ucapan ditampilkan di atas

**US-20**: As a guest, I want to see event details with maps so that I can plan attendance.
- AC:
  - Setiap event: tanggal, waktu, lokasi, Google Maps embed/open
  - Tampil berdasarkan urutan tanggal
  - Tampilan calendar-friendly (bisa add to calendar button)

---

### Epic: Template Theming

**US-21**: As a template designer (admin), I want each template to have its own locked themeConfig so that branding stays consistent.
- AC:
  - Setiap template punya themeConfig object dengan: primaryColor, secondaryColor, fontHeading, fontBody, bgStyle, borderRadius
  - themeConfig di-render di public page, TIDAK bisa di-override oleh end user
  - User tidak punya akses edit warna/font - konsistensi dijamin
  - Admin bisa edit themeConfig via admin panel

---

### Epic: Admin Panel

**US-22**: As an admin, I want to manage templates so that platform punya stok template yang cukup.
- AC:
  - CRUD template: judul, deskripsi, kategori, tier, thumbnail, component ref, themeConfig
  - Upload thumbnail preview (min 1, max 3 angles)
  - Preview template sebelum publish ke katalog
  - Bulk actions: activate/deactivate template

**US-23**: As an admin, I want to manage kategori template so that katalog terorganisir.
- AC:
  - CRUD kategori: nama, deskripsi, icon, urutan tampil
  - Hapus kategori hanya jika tidak ada template terkait
  - Reorder drag-and-drop

**US-24**: As an admin, I want to view user & payment data so that saya bisa monitor bisnis.
- AC:
  - Dashboard: jumlah user, undangan aktif, revenue bulan ini
  - Daftar user: email, plan, jumlah undangan, status
  - Daftar pembayaran: user, plan, jumlah, status (pending/success/failed), tanggal
  - Filter & search

---

## 4. Technical Specifications

### Architecture Overview

The platform uses a Next.js application as the primary web app for authenticated dashboard, admin panel, API routes, and public invitation rendering.

Recommended high-level architecture:

- **Frontend**: Next.js App Router, React, responsive public invitation pages, authenticated dashboard, admin panel.
- **Backend**: Next.js Route Handlers or Server Actions for auth-related flows, invitation CRUD, template CRUD, subscription lifecycle, Midtrans integration, and wish submission.
- **Database**: PostgreSQL for users, subscriptions, templates, invitations, content sections, payments, and wishes. All DB access via Prisma ORM as the single data-access layer (schema + migrations + type-safe client). No direct pg driver calls from app code.
- **Auth**: NextAuth using credentials provider for email-password sign in, with custom email verification and password reset flows.
- **Storage**: Supabase Storage for gallery images, template preview images, and other media assets.
- **Payments**: Midtrans Snap for checkout UI and Midtrans webhook for payment status updates.
- **Public Rendering**: Public slug route reads invitation content, template reference, and locked themeConfig, then renders the selected template.

### Recommended Stack

| Layer | Tech | Alasan |
|-------|------|--------|
| Frontend | Next.js 15 App Router + React + Tailwind CSS | SSR untuk public page (SEO), API Routes, ekosistem kaya |
| Auth | NextAuth.js (Credentials provider) + custom email flow | Kontrol penuh, sesuai kebutuhan email-password |
| Database ORM | Prisma ORM 5.x + PostgreSQL | Single source of truth via prisma/schema.prisma, type-safe client, migrations |
| File Storage | Supabase Storage (free tier 1GB) | Murah, CDN built-in, optimasi gambar |
| Payment | Midtrans Snap (popup) + webhook | Standar Indonesia, support VA, e-wallet, kartu |
| Deployment | Vercel (Next.js) + Supabase (DB + Storage) | Free tier untuk MVP, zero config |

### Database Schema (High-Level)

```text
users
  - id (UUID, PK)
  - email (unique)
  - name
  - password_hash
  - email_verified (timestamp)
  - role (user | admin)
  - created_at

subscriptions
  - id (UUID, PK)
  - user_id (FK -> users)
  - plan (free | basic | pro | premium)
  - status (active | expired | cancelled)
  - current_period_end
  - midtrans_subscription_id
  - created_at

invitations
  - id (UUID, PK)
  - user_id (FK -> users)
  - template_id (FK -> templates)
  - slug (unique)
  - title (nama pasangan)
  - status (draft | published | unpublished)
  - couple_name_groom
  - couple_name_bride
  - father_name_groom
  - father_name_bride
  - mother_name_groom
  - mother_name_bride
  - cover_image_url
  - love_story (JSON)
  - gifts (JSON)
  - created_at
  - updated_at

events
  - id (UUID, PK)
  - invitation_id (FK -> invitations)
  - title (e.g. "Akad Nikah", "Resepsi")
  - date
  - time_start
  - time_end
  - location_name
  - address
  - maps_url
  - sort_order

gallery_photos
  - id (UUID, PK)
  - invitation_id (FK -> invitations)
  - image_url
  - sort_order
  - created_at

wishes
  - id (UUID, PK)
  - invitation_id (FK -> invitations)
  - guest_name
  - message
  - created_at

templates
  - id (UUID, PK)
  - name
  - slug
  - category_id (FK -> categories)
  - tier (free | basic | pro | premium)
  - component_ref (React component path)
  - theme_config (JSON)
  - thumbnail_url
  - is_active
  - created_at

categories
  - id (UUID, PK)
  - name
  - slug
  - description
  - icon
  - sort_order
  - created_at

payments
  - id (UUID, PK)
  - user_id (FK -> users)
  - subscription_id (FK -> subscriptions)
  - midtrans_order_id
  - amount
  - status (pending | success | failed | expired)
  - payment_method
  - paid_at
  - created_at
```

### Prisma & Database Access

- **Role**: Prisma ORM is the ONLY database access layer. Route Handlers / Server Actions never query Postgres directly.
- **Version**: Prisma 5.x, provider postgresql, previewFeatures none for MVP.
- **Connection**: DATABASE_URL (pooled, port 6543 for Supabase) for app runtime, DIRECT_URL (port 5432) for migrations.
- **Schema location**: prisma/schema.prisma. Models: User, Subscription, Invitation, Event, GalleryPhoto, Wish, Template, Category, Payment. Enums: Role(user|admin), Plan(free|basic|pro|premium), InvitationStatus(draft|published|unpublished), PaymentStatus(pending|success|failed|expired).
- **Key relations**: User 1-n Invitation, User 1-n Subscription, Invitation 1-n Event/GalleryPhoto/Wish, Category 1-n Template, Template 1-n Invitation.
- **Key indexes**: users.email unique, invitations.slug unique, invitations(user_id, status), wishes(invitation_id, created_at), payments(midtrans_order_id unique).
- **Client singleton**: lib/prisma.ts exports prisma via globalThis guard to avoid exhausting connections in Next.js dev/HMR and serverless.
- **Migrations**: npx prisma migrate dev --name init for local, npx prisma migrate deploy on Vercel build/start. Never edit DB manually.
- **Seed**: prisma/seed.ts creates default admin, base categories (Modern, Traditional, Minimalist, Luxury, Islamic), and 2-3 starter templates with locked themeConfig.
- **Usage rule**: all reads/writes go through Prisma Client with explicit select/include to avoid over-fetching. Use interactive transactions for checkout + subscription activation.
- **Validation**: Zod at API boundary, Prisma for persistence. Prisma errors (P2002 unique violation for slug/email) mapped to 409 responses.

### API / Server Action Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/auth/signup | POST | Public | Register akun baru |
| /api/auth/verify-email | GET | Public | Verifikasi email via token |
| /api/auth/forgot-password | POST | Public | Request reset password |
| /api/auth/reset-password | POST | Public | Reset password via token |
| /api/invitations | GET | User | List undangan user |
| /api/invitations | POST | User | Buat undangan baru |
| /api/invitations/:id | GET | User | Detail undangan |
| /api/invitations/:id | PATCH | User | Update undangan |
| /api/invitations/:id/publish | POST | User | Publish undangan |
| /api/invitations/:id/unpublish | POST | User | Unpublish undangan |
| /api/invitations/:id/gallery | POST | User | Upload foto galeri |
| /api/invitations/:id/wishes | GET | Public | Ambil ucapan (paginated) |
| /api/invitations/:id/wishes | POST | Public | Submit ucapan |
| /api/subscription | GET | User | Info subscription user |
| /api/subscription/checkout | POST | User | Init Midtrans Snap checkout |
| /api/payment/webhook | POST | Midtrans | Midtrans callback |
| /api/admin/templates | GET/POST | Admin | CRUD template |
| /api/admin/templates/:id | PATCH/DELETE | Admin | Update/hapus template |
| /api/admin/categories | GET/POST | Admin | CRUD kategori |
| /api/admin/categories/:id | PATCH/DELETE | Admin | Update/hapus kategori |
| /api/admin/dashboard | GET | Admin | Statistik platform |
| /[slug] | GET | Public | Render undangan publik |

### Key Technical Decisions

1. **Public page rendering**: Server-side render (server component) untuk SEO. Slug di-resolve di server, template dihydrate dengan data invitation + locked themeConfig.

2. **themeConfig enforcement**: ThemeConfig disimpan di DB (templates table), di-baca hanya saat render public page. Tidak pernah dikirim ke client-side form. User tidak punya UI untuk mengubah warna/font.

3. **Image optimization**: Next.js Image component + Supabase Storage. Foto di-resize otomatis ke max 1200px width. Format WebP untuk browser modern.

4. **Wall of Wishes**: Polling setiap 10 detik (GET /api/invitations/:id/wishes?after=timestamp). Bukan websocket - MVP cukup polling, lebih murah di infra.

5. **Midtrans integration**: Snap popup di client -> backend generate transaction -> webhook handle status update. Subscription recurring belum di-MVP (manual renew dulu).

6. **Slug generation**: slugify(couple_name_groom + "-dan-" + couple_name_bride) -> cek uniqueness -> append -1, -2 jika duplikat.

---

## 5. Security & Privacy

| Concern | Mitigation |
|---------|------------|
| Password storage | bcrypt (12 rounds) - tidak pernah plain text |
| Session hijacking | NextAuth JWT, httpOnly cookies, 30-day expiry |
| SQL injection | Prisma ORM - parameterized queries otomatis |
| File upload abuse | Validate type (jpg/png/webp), max size (5MB), scan dengan Supabase Storage policies |
| Spam wishes | Rate limit 3/IP/jam, honeypot field |
| Payment fraud | Midtrans handles card fraud; webhook dipercaya dari Midtrans IP range |
| Data isolation | RLS di Supabase Storage; query hanya return data user sendiri (kecuali admin) |
| CSRF | NextAuth CSRF protection otomatis |
| XSS | React auto-escapes output; sanitize user input untuk wish text |

---

## 6. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Midtrans merchant approval lambat | Medium | High | Daftar sekarang (sebelum dev selesai). Fallback: mock payment untuk testing |
| Supabase Storage free tier limit (1GB) | Medium | Low | Upgrade ke Pro (/mo) jika approaching limit |
| Template rendering bugs di berbagai browser | Medium | Medium | Test di Chrome, Safari, Firefox (mobile + desktop). Minimal: Chrome Mobile |
| Spam/wishes abuse | High | Low | Rate limit + honeypot + manual review admin |
| Slug collision | Low | Low | Auto-append angka |
| User tidak verifikasi email | High | Medium | Reminder email + graceful degradation (batasi fitur) |

---

## 7. Phased Roadmap

### Phase 1: Foundation (Minggu 1-2)
- Setup Next.js project + Prisma + PostgreSQL
- NextAuth credentials (signup, signin, verify email, forgot password)
- Database schema + migrations
- Basic dashboard layout (authenticated)
- Supabase Storage setup

### Phase 2: Invitation Core (Minggu 3-5)
- Template browsing & selection
- Step-by-step invitation form (data pasangan, events, gallery, love story, gifts)
- Publish/unpublish flow
- Public slug rendering (basic template)
- Auto-save + validation

### Phase 3: Public Experience & Wishes (Minggu 6-7)
- Full public invitation page (responsive, countdown, gallery, maps)
- Wall of Wishes (submit + display)
- SEO meta tags
- Image optimization

### Phase 4: Monetization (Minggu 8-9)
- Free trial setup
- Subscription tiers logic (limit enforcement)
- Midtrans Snap integration
- Webhook handler
- Watermark logic untuk free tier

### Phase 5: Admin & Polish (Minggu 10-12)
- Admin panel: template CRUD, category CRUD, user/payment dashboard
- Template theming system (themeConfig per template)
- Admin dashboard analytics
- Bug fixes, performance tuning, accessibility pass
- UAT (User Acceptance Testing)

---

## 8. Non-Goals (Explicitly NOT Building in MVP)

- **Custom domain** - fitur v2
- **Custom template builder** (drag-and-drop editor) - terlalu kompleks untuk MVP
- **WhatsApp direct integration** (auto-kirim via WA Business API) - v2
- **Payment gateway selain Midtrans** - fokus Midtrans dulu
- **Multi-language** (Bahasa Indonesia saja di MVP)
- **Mobile app** (native) - web responsive sudah cukup
- **RSVP mechanism** (hadir/tidak hadir) - bisa tambah di v1.1
- **Email blast / undangan massal via email** - v2
- **Analytics mendalam** (page views per undangan) - v2
- **Gift registry / wishlist online** - v2

---

## 9. Pricing Strategy (Draft Hypothesis)

- **Baseline model**: Free trial + 3 paid tiers (Basic, Pro, Premium).
- **Draft pricing**: Free Rp0, Basic Rp49.000/bulan, Pro Rp99.000/bulan, Premium Rp199.000/bulan.
- **Primary upsell drivers**: jumlah undangan aktif, remove watermark, premium templates, custom domain, dan batas galeri foto.
- **Review rule**: pricing boleh disesuaikan setelah riset kompetitor (Undangan.in, Wedew, Invitation.id) dan pilot usage, tapi bentuk tier tetap dipertahankan untuk MVP.

---

*Document ini adalah source of truth untuk pengembangan MVP. Update jika ada perubahan scope.*

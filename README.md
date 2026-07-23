# Sistem Manajemen Jemaat

Aplikasi web untuk mengelola data jemaat, keluarga, wilayah pelayanan, pencatatan gerejawi, kegiatan, registrasi peserta, antrean, serta laporan operasional gereja.

Sistem ini dirancang untuk satu gereja induk dan tiga subinduk, dengan pembatasan akses berdasarkan peran dan unit gereja pengguna.

## Fitur Utama

### Administrasi Jemaat

- Pengelolaan unit gereja induk dan subinduk
- Pengelolaan wilayah pelayanan
- Pengelolaan keluarga
- Pengelolaan data jemaat
- Status jemaat aktif dan tidak aktif
- Perlindungan data sensitif seperti NIK dan Nomor KK
- Pencatatan baptisan, baptis dewasa, dan sidi
- Pencatatan pernikahan
- Pencatatan kematian
- Soft delete untuk data tertentu

### Event dan Operasional

- Pengelolaan kategori event
- Pengelolaan event umum dan event dengan registrasi
- Peserta jemaat dan nonjemaat
- Check-in peserta
- Nomor antrean saat kedatangan
- Pemanggilan antrean
- Tampilan antrean publik
- Realtime update menggunakan Ably
- Suara pemanggilan antrean pada halaman display
- Laporan event
- Ekspor laporan ke CSV

### Pengguna dan Keamanan

- Autentikasi menggunakan Better Auth
- Login dengan email dan kata sandi
- Lupa dan reset kata sandi
- Manajemen pengguna
- Pembatasan akses berdasarkan peran
- Pembatasan akses berdasarkan unit gereja
- Proteksi data NIK dan Nomor KK pada server dan antarmuka
- Dark mode

### Dashboard

- Total unit gereja
- Total wilayah
- Total keluarga
- Total jemaat
- Jemaat aktif dan tidak aktif
- Komposisi jemaat berdasarkan jenis kelamin
- Ringkasan baptisan, pernikahan, dan kematian tahun berjalan
- Aktivitas pencatatan terbaru

## Teknologi

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Neon
- Better Auth
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- nuqs
- Ably
- Nodemailer
- pnpm

## Struktur Proyek

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
├── components/
├── features/
│   ├── auth/
│   ├── baptisan/
│   ├── dashboard/
│   ├── event/
│   ├── jemaat/
│   ├── kategori-event/
│   ├── keluarga/
│   ├── kematian/
│   ├── pengguna/
│   ├── pernikahan/
│   ├── unit-gereja/
│   └── wilayah/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── generated/
│   └── prisma.ts
└── proxy.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

Pola umum setiap modul:

```text
feature/
├── api/
├── components/
├── hooks/
├── schemas/
├── server/
├── constants.ts
├── feature-keys.ts
└── types.ts
```

## Persyaratan

- Node.js 22.x
- pnpm 11.x
- PostgreSQL
- Akun Neon
- Akun Ably
- Akun Gmail dengan App Password untuk pengiriman email

## Instalasi

Clone repository:

```bash
git clone <URL_REPOSITORY>
cd sistem-manajemen-jemaat
```

Install dependency:

```bash
pnpm instal
```

Salin environment example:

```bash
cp .env.example .env
```

Generate Prisma Client:

```bash
pnpm db:generate
```

Jalankan migration:

```bash
pnpm db:migrate:deploy
```

Jalankan seed apabila tersedia:

```bash
pnpm prisma db seed
```

Jalankan development server:

```bash
pnpm dev
```

Aplikasi dapat dibuka di:

```text
http://localhost:3000
```

## Environment Variables

```env
# Neon PostgreSQL
# Gunakan pooled connection string untuk runtime aplikasi.
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/DATABASE?sslmode=require"

# Gunakan direct connection string untuk Prisma CLI dan migration.
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# Gmail SMTP
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
EMAIL_FROM="Sistem Manajemen Jemaat <email@gmail.com>"

# Ably
ABLY_API_KEY=""
```

Jangan menggunakan awalan `NEXT_PUBLIC_` untuk:

- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `GMAIL_APP_PASSWORD`
- `ABLY_API_KEY`

## Scripts

```bash
pnpm dev
```

Menjalankan development server.

```bash
pnpm build
```

Membuat production build.

```bash
pnpm start
```

Menjalankan production server.

```bash
pnpm lint
```

Menjalankan ESLint.

```bash
pnpm typecheck
```

Menjalankan pemeriksaan TypeScript.

```bash
pnpm format
```

Memformat kode menggunakan Prettier.

```bash
pnpm db:generate
```

Generate Prisma Client.

```bash
pnpm db:migrate:deploy
```

Menjalankan migration yang sudah tersedia.

```bash
pnpm db:migrate:status
```

Memeriksa status migration.

```bash
pnpm verify
```

Menjalankan lint, typecheck, dan production build.

## Peran Pengguna

- `SUPER_ADMIN`
- `ADMIN_INDUK`
- `ADMIN_SUB_INDUK`
- `SEKRETARIAT`
- `PANITIA_EVENT`
- `PETUGAS_REGISTRASI`
- `PETUGAS_ANTREAN`
- `PELAYAN`
- `VIEWER`

Konfigurasi hak akses terpusat berada di:

```text
src/lib/auth/access-roles.ts
```

Akses data juga dibatasi berdasarkan unit gereja pengguna.

## Perlindungan Data Sensitif

NIK dan Nomor KK tidak hanya disembunyikan pada antarmuka. Pembatasan juga diterapkan pada:

- Response API
- Pencarian
- Sorting
- Update data
- Detail dialog
- DataTable

Pengguna tanpa izin menerima nilai `null` atau field tidak disertakan sesuai implementasi endpoint.

## Aturan Data Penting

### Jemaat

- Satu jemaat hanya berada dalam satu wilayah.
- Jemaat yang sudah tidak aktif tidak dapat diaktifkan kembali.
- Jemaat yang meninggal tidak dapat diedit atau dihapus melalui modul Jemaat.
- Data historis yang telah dipakai modul lain harus tetap dijaga.

### Baptisan

- Unit gereja mengikuti jemaat yang dipilih.
- Satu jemaat hanya dapat mempunyai satu pencatatan aktif untuk jenis yang sama.
- Jenis pencatatan meliputi baptis anak, baptis dewasa, dan sidi.

### Pernikahan

- Minimal salah satu pihak harus berasal dari data jemaat.
- Kedua pihak tidak boleh merujuk pada jemaat yang sama.
- Nama pihak disimpan sebagai snapshot pencatatan.
- Pihak luar dapat dicatat secara manual.

### Kematian

- Unit gereja mengikuti jemaat.
- Umur saat meninggal dihitung oleh server.
- Tanggal penghiburan dan pemakaman tidak boleh sebelum tanggal meninggal.
- Status pencatatan: `DRAFT`, `TERVERIFIKASI`, dan `DIBATALKAN`.
- Verifikasi kematian mengubah status jemaat menjadi tidak aktif dengan alasan meninggal.
- Pencatatan terverifikasi bersifat final.

### Event

- Check-in dapat diaktifkan sesuai kebutuhan event.
- Peserta dapat berasal dari jemaat maupun nonjemaat.
- Nomor antrean diberikan saat peserta datang.
- Check-in dilakukan petugas saat pelayanan dimulai.
- Update operasional menggunakan Ably.
- API key Ably hanya tersedia pada server.

## Database dan Prisma

Schema utama:

```text
prisma/schema.prisma
```

Prisma Client dihasilkan ke:

```text
src/lib/generated/prisma
```

Prisma CLI menggunakan `DIRECT_URL`, sedangkan runtime aplikasi menggunakan `DATABASE_URL`.

Untuk production:

```bash
pnpm db:migrate:deploy
```

Hindari `prisma db push` sebagai prosedur deployment production.

## Realtime Ably

Pola channel:

```text
event:<eventId>
```

Event utama:

```text
event.changed
queue.called
```

`event.changed` digunakan untuk invalidasi TanStack Query.

`queue.called` digunakan untuk pemanggilan suara pada halaman display antrean.

Client memperoleh token subscribe melalui endpoint server. `ABLY_API_KEY` tidak dikirim langsung ke browser.

## Reset Kata Sandi

Pengiriman email menggunakan Gmail SMTP dan Nodemailer.

Akun Gmail harus memakai App Password.

```env
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
EMAIL_FROM=""
```

## Deployment ke Vercel

### Siapkan database

Gunakan Neon PostgreSQL:

- `DATABASE_URL`: pooled connection string
- `DIRECT_URL`: direct connection string

Jalankan migration production:

```bash
pnpm db:migrate:deploy
```

### Tambahkan environment variables

```text
DATABASE_URL
DIRECT_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GMAIL_USER
GMAIL_APP_PASSWORD
EMAIL_FROM
ABLY_API_KEY
```

### Konfigurasi build

```text
Node.js: 22.x
Install Command: pnpm install
Build Command: pnpm build
Output Directory: default Next.js
```

Pilih Vercel Function Region yang dekat dengan region database Neon. Contoh untuk Neon Singapore:

```text
sin1
```

## Pemeriksaan Production

- Login dan logout
- Session setelah refresh
- Reset kata sandi
- Hak akses tiap peran
- Pembatasan unit gereja
- Perlindungan NIK dan Nomor KK
- CRUD Unit Gereja
- CRUD Wilayah
- CRUD Keluarga
- CRUD Jemaat
- Pencatatan Baptisan
- Pencatatan Pernikahan
- Pencatatan Kematian
- Event dan antrean
- Realtime Ably
- Ekspor CSV
- Log Vercel tidak membocorkan data rahasia

## Verifikasi Sebelum Commit

```bash
pnpm verify
```

Pastikan lint, typecheck, dan build berhasil.

## Keamanan Repository

Jangan commit file berikut:

```text
.env
.env.local
.env.production.local
.vercel
```

Contoh `.gitignore`:

```gitignore
.env
.env.local
.env.development.local
.env.production.local
.env.test.local
.vercel

!.env.example
```

Jangan menyimpan:

- Password database
- Better Auth secret
- Gmail App Password
- Ably API Key
- Data pribadi jemaat
- Export database production

## Status Modul

- Autentikasi
- Dashboard
- Unit Gereja
- Wilayah
- Keluarga
- Jemaat
- Baptisan
- Pernikahan
- Kematian
- Pengguna
- Kategori Event
- Event
- Peserta Event
- Operasional dan antrean
- Realtime Ably
- Laporan Event
- Reset kata sandi
- Dark mode

Notifikasi aplikasi belum termasuk dalam scope saat ini.

## Lisensi

Proyek ini digunakan untuk kebutuhan internal gereja. Distribusi, penggunaan ulang, atau publikasi source code harus mengikuti persetujuan pemilik proyek.

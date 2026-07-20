-- CreateEnum
CREATE TYPE "JenisUnitGereja" AS ENUM ('INDUK', 'SUB_INDUK');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusJemaat" AS ENUM ('AKTIF', 'TIDAK_AKTIF');

-- CreateEnum
CREATE TYPE "AlasanTidakAktif" AS ENUM ('MENINGGAL', 'PINDAH_GEREJA', 'KELUAR_KEANGGOTAAN', 'DATA_GANDA', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PeranPengguna" AS ENUM ('SUPER_ADMIN', 'ADMIN_INDUK', 'ADMIN_SUB_INDUK', 'SEKRETARIAT', 'PANITIA_EVENT', 'PETUGAS_REGISTRASI', 'PETUGAS_ANTREAN', 'PELAYAN', 'VIEWER');

-- CreateEnum
CREATE TYPE "JenisEvent" AS ENUM ('UMUM', 'REGISTRASI');

-- CreateEnum
CREATE TYPE "StatusEvent" AS ENUM ('DRAFT', 'DIBUKA', 'DITUTUP', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "JenisPeserta" AS ENUM ('JEMAAT', 'NON_JEMAAT');

-- CreateEnum
CREATE TYPE "StatusPesertaEvent" AS ENUM ('TERCATAT', 'HADIR', 'MENUNGGU', 'DIPANGGIL', 'SELESAI', 'BATAL');

-- CreateEnum
CREATE TYPE "JenisBaptisan" AS ENUM ('BAPTIS_ANAK', 'BAPTIS_DEWASA', 'SIDI');

-- CreateEnum
CREATE TYPE "StatusPencatatanKematian" AS ENUM ('DRAFT', 'TERVERIFIKASI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_pengguna" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "peran" "PeranPengguna" NOT NULL DEFAULT 'VIEWER',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "unitGerejaId" UUID,
    "jemaatId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_gereja" (
    "id" UUID NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" "JenisUnitGereja" NOT NULL,
    "alamat" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "penanggungJawab" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_gereja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayah" (
    "id" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keluarga" (
    "id" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "nomorKK" VARCHAR(16) NOT NULL,
    "namaKepalaKeluarga" TEXT NOT NULL,
    "alamat" TEXT,
    "noHp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jemaat" (
    "id" UUID NOT NULL,
    "nomorIndukGereja" TEXT NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "namaPanggilan" TEXT,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" DATE,
    "alamat" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "foto" TEXT,
    "status" "StatusJemaat" NOT NULL DEFAULT 'AKTIF',
    "tanggalTidakAktif" DATE,
    "alasanTidakAktif" "AlasanTidakAktif",
    "keteranganTidakAktif" TEXT,
    "unitGerejaId" UUID NOT NULL,
    "wilayahId" UUID NOT NULL,
    "keluargaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "jemaat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_event" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "ikon" TEXT,
    "warna" TEXT,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "kategori_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "kategoriEventId" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jenis" "JenisEvent" NOT NULL DEFAULT 'UMUM',
    "lokasi" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "kapasitas" INTEGER,
    "status" "StatusEvent" NOT NULL DEFAULT 'DRAFT',
    "gunakanPencatatanPeserta" BOOLEAN NOT NULL DEFAULT false,
    "gunakanCheckIn" BOOLEAN NOT NULL DEFAULT false,
    "gunakanAntrean" BOOLEAN NOT NULL DEFAULT false,
    "izinkanNonJemaat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_umum" (
    "id" UUID NOT NULL,
    "nik" VARCHAR(16),
    "namaLengkap" TEXT NOT NULL,
    "jenisKelamin" "JenisKelamin",
    "tempatLahir" TEXT,
    "tanggalLahir" DATE,
    "alamat" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "peserta_umum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_event" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "jenisPeserta" "JenisPeserta" NOT NULL,
    "jemaatId" UUID,
    "pesertaUmumId" UUID,
    "namaPesertaSnapshot" TEXT NOT NULL,
    "nomorAntrian" INTEGER,
    "status" "StatusPesertaEvent" NOT NULL DEFAULT 'TERCATAT',
    "waktuTercatat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuCheckIn" TIMESTAMP(3),
    "waktuDipanggil" TIMESTAMP(3),
    "waktuSelesai" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "peserta_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baptisan" (
    "id" UUID NOT NULL,
    "jemaatId" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "jenis" "JenisBaptisan" NOT NULL,
    "tanggalBaptisan" DATE NOT NULL,
    "tempatBaptisan" TEXT,
    "namaPelayan" TEXT,
    "nomorSertifikat" TEXT,
    "dokumen" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "baptisan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pernikahan" (
    "id" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "nomorPencatatan" TEXT,
    "nomorSertifikat" TEXT,
    "tanggalPernikahan" DATE NOT NULL,
    "tempatPernikahan" TEXT,
    "namaPelayan" TEXT,
    "jemaatPihakSatuId" UUID,
    "namaPihakSatu" TEXT NOT NULL,
    "jemaatPihakDuaId" UUID,
    "namaPihakDua" TEXT NOT NULL,
    "namaSaksiSatu" TEXT,
    "namaSaksiDua" TEXT,
    "dokumen" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "pernikahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kematian" (
    "id" UUID NOT NULL,
    "jemaatId" UUID NOT NULL,
    "unitGerejaId" UUID NOT NULL,
    "tanggalMeninggal" DATE NOT NULL,
    "waktuMeninggal" TIME(0),
    "tempatMeninggal" TEXT,
    "penyebabKematian" TEXT,
    "umurSaatMeninggal" INTEGER,
    "nomorSuratKematian" TEXT,
    "instansiPenerbit" TEXT,
    "dokumenSuratKematian" TEXT,
    "alamatRumahDuka" TEXT,
    "tanggalIbadahPenghiburan" DATE,
    "waktuIbadahPenghiburan" TIME(0),
    "lokasiIbadahPenghiburan" TEXT,
    "namaPelayanPenghiburan" TEXT,
    "temaPelayanan" TEXT,
    "catatanPelayanan" TEXT,
    "tanggalPemakaman" DATE,
    "waktuPemakaman" TIME(0),
    "lokasiPemakaman" TEXT,
    "namaTempatPemakaman" TEXT,
    "namaPelayanPemakaman" TEXT,
    "nomorLokasiMakam" TEXT,
    "keteranganPemakaman" TEXT,
    "status" "StatusPencatatanKematian" NOT NULL DEFAULT 'DRAFT',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "kematian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pengguna_userId_key" ON "profil_pengguna"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pengguna_jemaatId_key" ON "profil_pengguna"("jemaatId");

-- CreateIndex
CREATE INDEX "profil_pengguna_peran_idx" ON "profil_pengguna"("peran");

-- CreateIndex
CREATE INDEX "profil_pengguna_aktif_idx" ON "profil_pengguna"("aktif");

-- CreateIndex
CREATE INDEX "profil_pengguna_unitGerejaId_idx" ON "profil_pengguna"("unitGerejaId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_gereja_kode_key" ON "unit_gereja"("kode");

-- CreateIndex
CREATE INDEX "unit_gereja_jenis_idx" ON "unit_gereja"("jenis");

-- CreateIndex
CREATE INDEX "unit_gereja_parentId_idx" ON "unit_gereja"("parentId");

-- CreateIndex
CREATE INDEX "unit_gereja_aktif_idx" ON "unit_gereja"("aktif");

-- CreateIndex
CREATE INDEX "wilayah_unitGerejaId_idx" ON "wilayah"("unitGerejaId");

-- CreateIndex
CREATE UNIQUE INDEX "wilayah_unitGerejaId_nama_key" ON "wilayah"("unitGerejaId", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "keluarga_nomorKK_key" ON "keluarga"("nomorKK");

-- CreateIndex
CREATE INDEX "keluarga_unitGerejaId_idx" ON "keluarga"("unitGerejaId");

-- CreateIndex
CREATE INDEX "keluarga_namaKepalaKeluarga_idx" ON "keluarga"("namaKepalaKeluarga");

-- CreateIndex
CREATE UNIQUE INDEX "jemaat_nomorIndukGereja_key" ON "jemaat"("nomorIndukGereja");

-- CreateIndex
CREATE UNIQUE INDEX "jemaat_nik_key" ON "jemaat"("nik");

-- CreateIndex
CREATE INDEX "jemaat_nomorIndukGereja_idx" ON "jemaat"("nomorIndukGereja");

-- CreateIndex
CREATE INDEX "jemaat_namaLengkap_idx" ON "jemaat"("namaLengkap");

-- CreateIndex
CREATE INDEX "jemaat_status_idx" ON "jemaat"("status");

-- CreateIndex
CREATE INDEX "jemaat_unitGerejaId_idx" ON "jemaat"("unitGerejaId");

-- CreateIndex
CREATE INDEX "jemaat_wilayahId_idx" ON "jemaat"("wilayahId");

-- CreateIndex
CREATE INDEX "jemaat_keluargaId_idx" ON "jemaat"("keluargaId");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_event_nama_key" ON "kategori_event"("nama");

-- CreateIndex
CREATE INDEX "kategori_event_aktif_idx" ON "kategori_event"("aktif");

-- CreateIndex
CREATE INDEX "event_unitGerejaId_idx" ON "event"("unitGerejaId");

-- CreateIndex
CREATE INDEX "event_kategoriEventId_idx" ON "event"("kategoriEventId");

-- CreateIndex
CREATE INDEX "event_tanggalMulai_idx" ON "event"("tanggalMulai");

-- CreateIndex
CREATE INDEX "event_jenis_idx" ON "event"("jenis");

-- CreateIndex
CREATE INDEX "event_status_idx" ON "event"("status");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_umum_nik_key" ON "peserta_umum"("nik");

-- CreateIndex
CREATE INDEX "peserta_umum_namaLengkap_idx" ON "peserta_umum"("namaLengkap");

-- CreateIndex
CREATE INDEX "peserta_umum_noHp_idx" ON "peserta_umum"("noHp");

-- CreateIndex
CREATE INDEX "peserta_event_eventId_idx" ON "peserta_event"("eventId");

-- CreateIndex
CREATE INDEX "peserta_event_jemaatId_idx" ON "peserta_event"("jemaatId");

-- CreateIndex
CREATE INDEX "peserta_event_pesertaUmumId_idx" ON "peserta_event"("pesertaUmumId");

-- CreateIndex
CREATE INDEX "peserta_event_status_idx" ON "peserta_event"("status");

-- CreateIndex
CREATE INDEX "peserta_event_nomorAntrian_idx" ON "peserta_event"("nomorAntrian");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_event_eventId_jemaatId_key" ON "peserta_event"("eventId", "jemaatId");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_event_eventId_pesertaUmumId_key" ON "peserta_event"("eventId", "pesertaUmumId");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_event_eventId_nomorAntrian_key" ON "peserta_event"("eventId", "nomorAntrian");

-- CreateIndex
CREATE UNIQUE INDEX "baptisan_nomorSertifikat_key" ON "baptisan"("nomorSertifikat");

-- CreateIndex
CREATE INDEX "baptisan_jemaatId_idx" ON "baptisan"("jemaatId");

-- CreateIndex
CREATE INDEX "baptisan_unitGerejaId_idx" ON "baptisan"("unitGerejaId");

-- CreateIndex
CREATE INDEX "baptisan_tanggalBaptisan_idx" ON "baptisan"("tanggalBaptisan");

-- CreateIndex
CREATE UNIQUE INDEX "pernikahan_nomorPencatatan_key" ON "pernikahan"("nomorPencatatan");

-- CreateIndex
CREATE UNIQUE INDEX "pernikahan_nomorSertifikat_key" ON "pernikahan"("nomorSertifikat");

-- CreateIndex
CREATE INDEX "pernikahan_unitGerejaId_idx" ON "pernikahan"("unitGerejaId");

-- CreateIndex
CREATE INDEX "pernikahan_tanggalPernikahan_idx" ON "pernikahan"("tanggalPernikahan");

-- CreateIndex
CREATE INDEX "pernikahan_jemaatPihakSatuId_idx" ON "pernikahan"("jemaatPihakSatuId");

-- CreateIndex
CREATE INDEX "pernikahan_jemaatPihakDuaId_idx" ON "pernikahan"("jemaatPihakDuaId");

-- CreateIndex
CREATE UNIQUE INDEX "kematian_jemaatId_key" ON "kematian"("jemaatId");

-- CreateIndex
CREATE UNIQUE INDEX "kematian_nomorSuratKematian_key" ON "kematian"("nomorSuratKematian");

-- CreateIndex
CREATE INDEX "kematian_unitGerejaId_idx" ON "kematian"("unitGerejaId");

-- CreateIndex
CREATE INDEX "kematian_tanggalMeninggal_idx" ON "kematian"("tanggalMeninggal");

-- CreateIndex
CREATE INDEX "kematian_status_idx" ON "kematian"("status");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "jemaat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_gereja" ADD CONSTRAINT "unit_gereja_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wilayah" ADD CONSTRAINT "wilayah_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keluarga" ADD CONSTRAINT "keluarga_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jemaat" ADD CONSTRAINT "jemaat_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jemaat" ADD CONSTRAINT "jemaat_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jemaat" ADD CONSTRAINT "jemaat_keluargaId_fkey" FOREIGN KEY ("keluargaId") REFERENCES "keluarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_kategoriEventId_fkey" FOREIGN KEY ("kategoriEventId") REFERENCES "kategori_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_event" ADD CONSTRAINT "peserta_event_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_event" ADD CONSTRAINT "peserta_event_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_event" ADD CONSTRAINT "peserta_event_pesertaUmumId_fkey" FOREIGN KEY ("pesertaUmumId") REFERENCES "peserta_umum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baptisan" ADD CONSTRAINT "baptisan_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baptisan" ADD CONSTRAINT "baptisan_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pernikahan" ADD CONSTRAINT "pernikahan_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pernikahan" ADD CONSTRAINT "pernikahan_jemaatPihakSatuId_fkey" FOREIGN KEY ("jemaatPihakSatuId") REFERENCES "jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pernikahan" ADD CONSTRAINT "pernikahan_jemaatPihakDuaId_fkey" FOREIGN KEY ("jemaatPihakDuaId") REFERENCES "jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kematian" ADD CONSTRAINT "kematian_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kematian" ADD CONSTRAINT "kematian_unitGerejaId_fkey" FOREIGN KEY ("unitGerejaId") REFERENCES "unit_gereja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

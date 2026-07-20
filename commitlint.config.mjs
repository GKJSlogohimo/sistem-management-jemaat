import { defineConfig } from "cz-git";

export default defineConfig({
  extends: ["@commitlint/config-conventional"],

  rules: {
    "header-max-length": [2, "always", 100],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-empty": [2, "never"],

    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
  },

  prompt: {
    messages: {
      type: "Pilih jenis perubahan:",
      scope: "Pilih bagian yang berubah:",
      customScope: "Masukkan scope:",
      subject: "Tuliskan ringkasan perubahan:\n",
      body: "Tuliskan penjelasan lebih lengkap (opsional). Gunakan | untuk baris baru:\n",
      breaking: "Jelaskan breaking change (opsional). Gunakan | untuk baris baru:\n",
      footerPrefixSelect: "Pilih jenis referensi issue (opsional):",
      customFooterPrefix: "Masukkan prefix issue:",
      footer: "Masukkan nomor issue, contoh #12 atau #25:\n",
      confirmCommit: "Lanjutkan commit dengan pesan di atas?",
    },

    types: [
      {
        value: "feat",
        name: "feat:     Menambahkan fitur baru",
        emoji: ":sparkles:",
      },
      {
        value: "fix",
        name: "fix:      Memperbaiki bug",
        emoji: ":bug:",
      },
      {
        value: "docs",
        name: "docs:     Mengubah dokumentasi",
        emoji: ":memo:",
      },
      {
        value: "style",
        name: "style:    Mengubah format tanpa mengubah logika",
        emoji: ":lipstick:",
      },
      {
        value: "refactor",
        name: "refactor: Mengubah struktur kode tanpa fitur baru",
        emoji: ":recycle:",
      },
      {
        value: "perf",
        name: "perf:     Meningkatkan performa",
        emoji: ":zap:",
      },
      {
        value: "test",
        name: "test:     Menambah atau memperbaiki pengujian",
        emoji: ":white_check_mark:",
      },
      {
        value: "build",
        name: "build:    Mengubah dependency atau sistem build",
        emoji: ":package:",
      },
      {
        value: "ci",
        name: "ci:       Mengubah konfigurasi CI/CD",
        emoji: ":construction_worker:",
      },
      {
        value: "chore",
        name: "chore:    Pemeliharaan project",
        emoji: ":wrench:",
      },
      {
        value: "revert",
        name: "revert:   Membatalkan commit sebelumnya",
        emoji: ":rewind:",
      },
    ],

    scopes: [
      { value: "auth", name: "auth: autentikasi dan otorisasi" },
      { value: "jemaat", name: "jemaat: data jemaat" },
      { value: "keluarga", name: "keluarga: data keluarga" },
      { value: "wilayah", name: "wilayah: induk, subinduk, dan wilayah" },
      { value: "pelayanan", name: "pelayanan: pelayanan gereja" },
      { value: "event", name: "event: kegiatan dan registrasi" },
      { value: "kesehatan", name: "kesehatan: pemeriksaan kesehatan" },
      { value: "kematian", name: "kematian: pencatatan kematian" },
      { value: "database", name: "database: basis data umum" },
      { value: "prisma", name: "prisma: schema dan migrasi Prisma" },
      { value: "ui", name: "ui: antarmuka pengguna" },
      { value: "config", name: "config: konfigurasi project" },
      { value: "deps", name: "deps: dependency project" },
    ],

    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlias: "scope lainnya",
    emptyScopesAlias: "tanpa scope",

    allowBreakingChanges: ["feat", "fix"],
    markBreakingChangeMode: true,

    useEmoji: false,
    upperCaseSubject: false,
    breaklineNumber: 100,
    confirmColorize: true,
  },
});

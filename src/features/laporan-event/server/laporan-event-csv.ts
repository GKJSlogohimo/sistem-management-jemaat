import type { LaporanEvent } from "../types/laporan-event.types";

function protectSpreadsheetFormula(value: string) {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

function escapeCsvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = protectSpreadsheetFormula(String(value));

  return `"${normalized.replaceAll('"', '""')}"`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function buildLaporanEventCsv(
  laporan: LaporanEvent,
  options: {
    includeNik: boolean;
  },
) {
  const rows: unknown[][] = [
    ["LAPORAN EVENT", laporan.event.nama],

    ["Unit Gereja", `${laporan.event.unitGereja.kode} - ${laporan.event.unitGereja.nama}`],

    ["Kategori", laporan.event.kategoriEvent.nama],

    ["Tanggal", formatDate(laporan.event.tanggalMulai)],

    [],

    ["Total Peserta", laporan.ringkasan.totalPeserta],

    ["Total Hadir", laporan.ringkasan.totalHadir],

    ["Total Selesai", laporan.ringkasan.totalSelesai],

    ["Persentase Kehadiran", `${laporan.ringkasan.persentaseKehadiran}%`],

    ["Rata-rata Waktu Tunggu", laporan.ringkasan.rataRataTungguMenit ?? ""],

    ["Rata-rata Pelayanan", laporan.ringkasan.rataRataPelayananMenit ?? ""],

    [],

    [
      "No.",
      "Nomor Antrean",
      ...(options.includeNik ? ["NIK"] : []),
      "Nama Peserta",
      "Alamat",
      "Jenis Peserta",
      "Status",
      "Waktu Tercatat",
      "Waktu Check-in",
      "Waktu Dipanggil",
      "Waktu Selesai",
      "Catatan",
    ],
  ];

  laporan.peserta.forEach((peserta, index) => {
    rows.push([
      index + 1,

      peserta.nomorAntrian ?? "",

      ...(options.includeNik ? [peserta.nik ?? ""] : []),

      peserta.nama,

      peserta.alamat ?? "",

      peserta.jenisPeserta === "JEMAAT" ? "Jemaat" : "Nonjemaat",

      peserta.status,

      formatDate(peserta.waktuTercatat),

      formatDate(peserta.waktuCheckIn),

      formatDate(peserta.waktuDipanggil),

      formatDate(peserta.waktuSelesai),

      peserta.catatan ?? "",
    ]);
  });

  const csv = rows.map((row) => row.map(escapeCsvCell).join(";")).join("\r\n");

  /*
   * BOM membantu Microsoft Excel
   * membaca UTF-8 dengan benar.
   */
  return `\uFEFF${csv}`;
}

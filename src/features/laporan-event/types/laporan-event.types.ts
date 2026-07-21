import type {
  JenisEvent,
  JenisPeserta,
  StatusEvent,
  StatusPesertaEvent,
} from "@/generated/prisma/client";

export type LaporanEventParticipant = {
  id: string;
  nama: string;
  nik: string | null;
  alamat: string | null;
  jenisPeserta: JenisPeserta;
  nomorAntrian: number | null;
  status: StatusPesertaEvent;
  waktuTercatat: string;
  waktuCheckIn: string | null;
  waktuDipanggil: string | null;
  waktuSelesai: string | null;
  catatan: string | null;
};

export type LaporanEventSummary = {
  totalPeserta: number;
  totalHadir: number;
  totalSelesai: number;
  totalBatal: number;
  persentaseKehadiran: number;
  rataRataTungguMenit: number | null;
  rataRataPelayananMenit: number | null;
};

export type LaporanEvent = {
  event: {
    id: string;
    nama: string;
    jenis: JenisEvent;
    status: StatusEvent;
    lokasi: string | null;
    tanggalMulai: string;
    tanggalSelesai: string | null;
    gunakanCheckIn: boolean;
    gunakanAntrean: boolean;

    unitGereja: {
      id: string;
      kode: string;
      nama: string;
    };

    kategoriEvent: {
      id: string;
      nama: string;
    };
  };

  ringkasanStatus: Record<StatusPesertaEvent, number>;

  ringkasan: LaporanEventSummary;

  peserta: LaporanEventParticipant[];
};

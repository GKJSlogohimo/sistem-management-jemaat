import type { OperasionalEventActionInput } from "./schemas/operasional-event.schema";

export type OperasionalParticipantStatus =
  "TERCATAT" | "HADIR" | "MENUNGGU" | "DIPANGGIL" | "SELESAI" | "BATAL";

export type OperasionalParticipant = {
  id: string;
  eventId: string;

  jenisPeserta: "JEMAAT" | "NON_JEMAAT";

  nama: string;
  nik: string | null;
  noHp: string | null;

  nomorAntrian: number | null;
  status: OperasionalParticipantStatus;

  waktuTercatat: string;
  waktuCheckIn: string | null;
  waktuDipanggil: string | null;
  waktuSelesai: string | null;

  catatan: string | null;
};

export type OperasionalEventState = {
  event: {
    id: string;
    nama: string;
    status: "DRAFT" | "DIBUKA" | "DITUTUP" | "DIBATALKAN";

    tanggalMulai: string;
    tanggalSelesai: string | null;

    gunakanCheckIn: boolean;
    gunakanAntrean: boolean;

    unitGereja: {
      id: string;
      kode: string;
      nama: string;
    };
  };

  ringkasan: Record<OperasionalParticipantStatus, number>;

  nomorAntrianBerikutnya: number;

  tercatat: OperasionalParticipant[];
  hadir: OperasionalParticipant[];
  menunggu: OperasionalParticipant[];
  dipanggil: OperasionalParticipant[];
  selesai: OperasionalParticipant[];
};

export type ExecuteOperasionalEventInput = OperasionalEventActionInput;

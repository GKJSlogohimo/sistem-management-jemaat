import type {
  JenisPesertaValue,
  PesertaEventFormValues,
  PesertaEventListQuery,
  StatusPesertaEventValue,
} from "./schemas/peserta-event.schema";

export type ParticipantSource = {
  nik: string | null;
  namaLengkap: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN" | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  alamat: string | null;
  noHp: string | null;
  email: string | null;
};

export type PesertaEventListItem = {
  id: string;
  eventId: string;

  jenisPeserta: JenisPesertaValue;

  jemaatId: string | null;
  pesertaUmumId: string | null;

  namaPesertaSnapshot: string;

  nomorAntrian: number | null;
  status: StatusPesertaEventValue;

  waktuTercatat: string;
  waktuCheckIn: string | null;
  waktuDipanggil: string | null;
  waktuSelesai: string | null;

  catatan: string | null;

  sumber: ParticipantSource;

  createdAt: string;
  updatedAt: string;
};

export type PesertaEventDetail = PesertaEventListItem;

export type JemaatEventOption = {
  id: string;
  nomorIndukGereja: string;
  nik: string;
  namaLengkap: string;
  unitGereja: {
    id: string;
    kode: string;
    nama: string;
  };
  wilayah: {
    id: string;
    nama: string;
  };
};

export type PesertaEventListParams = PesertaEventListQuery;

export type CreatePesertaEventInput = PesertaEventFormValues;

export type UpdatePesertaEventInput = PesertaEventFormValues;

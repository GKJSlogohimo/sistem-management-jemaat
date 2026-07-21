import type {
  EventFormValues,
  EventListQuery,
  JenisEventValue,
  StatusEventValue,
} from "./schemas/event.schema";

export type EventUnitReference = {
  id: string;
  kode: string;
  nama: string;
};

export type EventKategoriReference = {
  id: string;
  nama: string;
  ikon: string | null;
  warna: string | null;
};

export type EventListItem = {
  id: string;

  unitGerejaId: string;
  kategoriEventId: string;

  nama: string;
  deskripsi: string | null;
  jenis: JenisEventValue;
  lokasi: string | null;

  tanggalMulai: string;
  tanggalSelesai: string | null;

  kapasitas: number | null;
  status: StatusEventValue;

  gunakanPencatatanPeserta: boolean;
  gunakanCheckIn: boolean;
  gunakanAntrean: boolean;
  izinkanNonJemaat: boolean;

  unitGereja: EventUnitReference;
  kategoriEvent: EventKategoriReference;

  jumlahPeserta: number;

  createdAt: string;
  updatedAt: string;
};

export type EventDetail = EventListItem;

export type EventListParams = EventListQuery;

export type CreateEventInput = EventFormValues;

export type UpdateEventInput = EventFormValues;

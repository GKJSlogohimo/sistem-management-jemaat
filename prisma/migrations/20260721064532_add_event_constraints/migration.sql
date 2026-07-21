DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO invalid_count
  FROM "event"
  WHERE
    ("kapasitas" IS NOT NULL AND "kapasitas" <= 0)
    OR (
      "tanggalSelesai" IS NOT NULL
      AND "tanggalSelesai" < "tanggalMulai"
    )
    OR (
      "gunakanAntrean"
      AND NOT "gunakanCheckIn"
    )
    OR (
      "gunakanCheckIn"
      AND NOT "gunakanPencatatanPeserta"
    );

  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'Ditemukan % Event dengan konfigurasi tidak valid.',
      invalid_count;
  END IF;
END
$$;

ALTER TABLE "event"
ADD CONSTRAINT "event_kapasitas_positif"
CHECK (
  "kapasitas" IS NULL
  OR "kapasitas" > 0
);

ALTER TABLE "event"
ADD CONSTRAINT "event_konfigurasi_operasional_valid"
CHECK (
  (
    NOT "gunakanAntrean"
    OR "gunakanCheckIn"
  )
  AND (
    NOT "gunakanCheckIn"
    OR "gunakanPencatatanPeserta"
  )
);

ALTER TABLE "event"
ADD CONSTRAINT "event_rentang_tanggal_valid"
CHECK (
  "tanggalSelesai" IS NULL
  OR "tanggalSelesai" >= "tanggalMulai"
);
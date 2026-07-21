DO $$
DECLARE
  invalid_source_count INTEGER;
  invalid_queue_count INTEGER;
  invalid_nik_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO invalid_source_count
  FROM "peserta_event"
  WHERE NOT (
    (
      "jenisPeserta" = 'JEMAAT'
      AND "jemaatId" IS NOT NULL
      AND "pesertaUmumId" IS NULL
    )
    OR
    (
      "jenisPeserta" = 'NON_JEMAAT'
      AND "jemaatId" IS NULL
      AND "pesertaUmumId" IS NOT NULL
    )
  );

  SELECT COUNT(*)
  INTO invalid_queue_count
  FROM "peserta_event"
  WHERE
    "nomorAntrian" IS NOT NULL
    AND "nomorAntrian" <= 0;

  SELECT COUNT(*)
  INTO invalid_nik_count
  FROM "peserta_umum"
  WHERE
    "nik" IS NOT NULL
    AND "nik" !~ '^[0-9]{16}$';

  IF invalid_source_count > 0 THEN
    RAISE EXCEPTION
      'Ditemukan % peserta event dengan sumber tidak valid.',
      invalid_source_count;
  END IF;

  IF invalid_queue_count > 0 THEN
    RAISE EXCEPTION
      'Ditemukan % peserta event dengan nomor antrean tidak valid.',
      invalid_queue_count;
  END IF;

  IF invalid_nik_count > 0 THEN
    RAISE EXCEPTION
      'Ditemukan % peserta umum dengan NIK tidak valid.',
      invalid_nik_count;
  END IF;
END
$$;

ALTER TABLE "peserta_event"
ADD CONSTRAINT "peserta_event_sumber_valid"
CHECK (
  (
    "jenisPeserta" = 'JEMAAT'
    AND "jemaatId" IS NOT NULL
    AND "pesertaUmumId" IS NULL
  )
  OR
  (
    "jenisPeserta" = 'NON_JEMAAT'
    AND "jemaatId" IS NULL
    AND "pesertaUmumId" IS NOT NULL
  )
);

ALTER TABLE "peserta_event"
ADD CONSTRAINT "peserta_event_nomor_antrean_positif"
CHECK (
  "nomorAntrian" IS NULL
  OR "nomorAntrian" > 0
);

ALTER TABLE "peserta_umum"
ADD CONSTRAINT "peserta_umum_nik_16_digit"
CHECK (
  "nik" IS NULL
  OR "nik" ~ '^[0-9]{16}$'
);
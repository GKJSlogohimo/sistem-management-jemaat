-- Periksa data lama sebelum menambahkan constraint.
-- Migration akan dihentikan jika terdapat nomor KK yang tidak valid.

DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO invalid_count
  FROM "keluarga"
  WHERE "nomorKK" !~ '^[0-9]{16}$';

  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'Tidak dapat menambahkan constraint nomor KK: ditemukan % data keluarga dengan nomor KK tidak valid.',
      invalid_count;
  END IF;
END
$$;

-- Nomor KK wajib terdiri dari tepat 16 digit angka.
ALTER TABLE "keluarga"
ADD CONSTRAINT "keluarga_nomor_kk_format_check"
CHECK ("nomorKK" ~ '^[0-9]{16}$');
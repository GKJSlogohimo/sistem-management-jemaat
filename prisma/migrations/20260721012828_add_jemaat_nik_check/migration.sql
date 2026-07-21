DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO invalid_count
  FROM "jemaat"
  WHERE "nik" !~ '^[0-9]{16}$';

  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'Ditemukan % data jemaat dengan NIK tidak valid.',
      invalid_count;
  END IF;
END
$$;

ALTER TABLE "jemaat"
ADD CONSTRAINT "jemaat_nik_16_digit"
CHECK ("nik" ~ '^[0-9]{16}$');
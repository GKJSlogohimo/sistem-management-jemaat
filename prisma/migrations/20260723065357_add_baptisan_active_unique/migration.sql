CREATE UNIQUE INDEX "baptisan_jemaat_jenis_aktif_unique"
ON "baptisan" ("jemaatId", "jenis")
WHERE "deletedAt" IS NULL;
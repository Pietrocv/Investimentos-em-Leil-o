ALTER TABLE "Property" ALTER COLUMN "status" SET DEFAULT 'VENDENDO';
UPDATE "Property" SET "status" = 'VENDENDO' WHERE "status" <> 'VENDIDO';

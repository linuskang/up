-- AlterTable
ALTER TABLE "Webhook"
ADD COLUMN "events" TEXT[] NOT NULL DEFAULT ARRAY['*']::TEXT[];

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "pushNotify" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "icon" SET DEFAULT '~';

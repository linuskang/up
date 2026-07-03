/*
  Warnings:

  - Added the required column `name` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Webhook_projectId_idx" ON "Webhook"("projectId");

-- CreateIndex
CREATE INDEX "Webhook_projectId_subscription_idx" ON "Webhook"("projectId", "subscription");

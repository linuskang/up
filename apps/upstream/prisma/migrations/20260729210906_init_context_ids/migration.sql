-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "contextId" TEXT;

-- CreateTable
CREATE TABLE "EventContext" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventContext_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "EventContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;

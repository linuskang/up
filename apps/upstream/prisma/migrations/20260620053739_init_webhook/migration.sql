-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "subscription" TEXT NOT NULL,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "userAgent" TEXT,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestLog_projectId_createdAt_idx" ON "RequestLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestLog_projectId_status_idx" ON "RequestLog"("projectId", "status");

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

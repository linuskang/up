-- CreateTable
CREATE TABLE "ProjectAuditLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectAuditLog_projectId_createdAt_idx" ON "ProjectAuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectAuditLog_actorUserId_idx" ON "ProjectAuditLog"("actorUserId");

-- AddForeignKey
ALTER TABLE "ProjectAuditLog" ADD CONSTRAINT "ProjectAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAuditLog" ADD CONSTRAINT "ProjectAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

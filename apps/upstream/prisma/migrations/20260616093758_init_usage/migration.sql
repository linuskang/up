-- CreateTable
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "eventCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserUsage_userId_idx" ON "UserUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_userId_month_key" ON "UserUsage"("userId", "month");

-- AddForeignKey
ALTER TABLE "UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

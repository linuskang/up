-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('Hobby', 'Pro');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountPlan" "Plan" NOT NULL DEFAULT 'Hobby';

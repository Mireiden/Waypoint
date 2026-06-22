/*
  Warnings:

  - Added the required column `reason` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'inappropriate', 'inaccurate', 'duplicate', 'other');

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "reason",
ADD COLUMN     "reason" "ReportReason" NOT NULL,
DROP CONSTRAINT report_has_target;

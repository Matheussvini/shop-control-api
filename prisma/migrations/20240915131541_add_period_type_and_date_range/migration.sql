/*
  Warnings:

  - The `period` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `endDate` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('day', 'week', 'month', 'quarter', 'half_year', 'year');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "period",
ADD COLUMN     "period" "PeriodType" NOT NULL DEFAULT 'month';

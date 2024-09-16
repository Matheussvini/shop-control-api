/*
  Warnings:

  - You are about to drop the column `endDate` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `reports` table. All the data in the column will be lost.
  - Added the required column `filters` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "filters" JSONB NOT NULL;

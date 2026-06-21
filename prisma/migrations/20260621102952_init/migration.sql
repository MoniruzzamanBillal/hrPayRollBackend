/*
  Warnings:

  - You are about to drop the column `departmentId` on the `designations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `designations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "designations" DROP CONSTRAINT "designations_departmentId_fkey";

-- DropIndex
DROP INDEX "designations_title_departmentId_key";

-- AlterTable
ALTER TABLE "designations" DROP COLUMN "departmentId";

-- CreateIndex
CREATE UNIQUE INDEX "designations_title_key" ON "designations"("title");

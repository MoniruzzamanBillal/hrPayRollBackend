-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "designations" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "employee_documents" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

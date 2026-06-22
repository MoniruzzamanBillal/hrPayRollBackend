-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEAM_LEAD';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

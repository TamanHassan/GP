-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "isPartial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP DEFAULT;

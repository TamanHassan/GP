/*
  Warnings:

  - The values [employer,employee] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('EMPLOYER', 'EMPLOYEE');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayStatus" "DayStatus" NOT NULL,
    "preferMorning" BOOLEAN NOT NULL DEFAULT false,
    "preferAfternoon" BOOLEAN NOT NULL DEFAULT false,
    "preferNight" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Availability_employeeId_date_key" ON "Availability"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

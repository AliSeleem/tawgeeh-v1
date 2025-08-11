/*
  Warnings:

  - You are about to drop the column `availableFrom` on the `MentorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `breakMinutes` on the `MentorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `expireAt` on the `MentorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `MentorAvailability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mentorServiceId]` on the table `MentorAvailability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mentorId,mentorServiceId]` on the table `MentorAvailability` will be added. If there are existing duplicate values, this will fail.
  - Made the column `mentorServiceId` on table `MentorAvailability` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MentorAvailability" DROP CONSTRAINT "MentorAvailability_mentorServiceId_fkey";

-- AlterTable
ALTER TABLE "MentorAvailability" DROP COLUMN "availableFrom",
DROP COLUMN "breakMinutes",
DROP COLUMN "expireAt",
DROP COLUMN "title",
ADD COLUMN     "break" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "mentorServiceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MentorRequest" ALTER COLUMN "reviewedBy" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_url" SET DEFAULT 'http://168.231.114.196/uploads/image_url.jpg';

-- CreateIndex
CREATE UNIQUE INDEX "MentorAvailability_mentorServiceId_key" ON "MentorAvailability"("mentorServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorAvailability_mentorId_mentorServiceId_key" ON "MentorAvailability"("mentorId", "mentorServiceId");

-- AddForeignKey
ALTER TABLE "MentorAvailability" ADD CONSTRAINT "MentorAvailability_mentorServiceId_fkey" FOREIGN KEY ("mentorServiceId") REFERENCES "MentorService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

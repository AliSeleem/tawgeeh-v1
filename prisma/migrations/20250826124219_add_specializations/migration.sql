/*
  Warnings:

  - You are about to drop the column `specialization` on the `MentorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `User` table. All the data in the column will be lost.
  - Added the required column `specializationId` to the `MentorRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `experienceLevel` on the `MentorRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "MentorAvailability" DROP CONSTRAINT "MentorAvailability_mentorServiceId_fkey";

-- AlterTable
ALTER TABLE "MentorRequest" DROP COLUMN "specialization",
ADD COLUMN     "specializationId" INTEGER NOT NULL,
DROP COLUMN "experienceLevel",
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "specialization",
ADD COLUMN     "mentorRequestState" "ReqStat",
ADD COLUMN     "specializationId" INTEGER;

-- CreateTable
CREATE TABLE "SpecializationCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecializationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecializationCategory_name_idx" ON "SpecializationCategory"("name");

-- CreateIndex
CREATE INDEX "Specialization_categoryId_idx" ON "Specialization"("categoryId");

-- CreateIndex
CREATE INDEX "Specialization_name_idx" ON "Specialization"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpecializationCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAvailability" ADD CONSTRAINT "MentorAvailability_mentorServiceId_fkey" FOREIGN KEY ("mentorServiceId") REFERENCES "MentorService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

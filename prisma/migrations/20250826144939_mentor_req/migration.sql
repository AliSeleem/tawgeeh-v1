/*
  Warnings:

  - You are about to drop the column `TargetMentees` on the `MentorRequest` table. All the data in the column will be lost.
  - Added the required column `experience` to the `MentorRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MentorRequest" DROP COLUMN "TargetMentees",
ADD COLUMN     "behance" TEXT,
ADD COLUMN     "dribbble" TEXT,
ADD COLUMN     "experience" INTEGER NOT NULL,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "instagram" TEXT,
ALTER COLUMN "experienceLevel" DROP NOT NULL;

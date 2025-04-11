/*
  Warnings:

  - You are about to drop the column `requested_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `requester_id` on the `Session` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SessionStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "SessionStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "ChatParticipants" DROP CONSTRAINT "ChatParticipants_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_requested_id_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_requester_id_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ChatParticipants" ADD COLUMN     "lastRead" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "requested_id",
DROP COLUMN "requester_id",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "requestedId" INTEGER NOT NULL,
ADD COLUMN     "requesterId" INTEGER NOT NULL,
ADD COLUMN     "serviceId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "behance" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "isMentor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "totalMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "video_url" TEXT;

-- CreateTable
CREATE TABLE "MentorService" (
    "id" SERIAL NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorAvailability" (
    "id" SERIAL NOT NULL,
    "mentorId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "specificDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlotBooking" (
    "id" SERIAL NOT NULL,
    "availabilityId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlotBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "company" VARCHAR(100) NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3),
    "stillThere" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "donor" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expireAt" TIMESTAMP(3),
    "number" VARCHAR(100),
    "link" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "school" VARCHAR(100) NOT NULL,
    "degree" VARCHAR(100) NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "raterId" INTEGER NOT NULL,
    "stars" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorService_mentorId_idx" ON "MentorService"("mentorId");

-- CreateIndex
CREATE INDEX "MentorAvailability_mentorId_idx" ON "MentorAvailability"("mentorId");

-- CreateIndex
CREATE INDEX "MentorAvailability_dayOfWeek_idx" ON "MentorAvailability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "MentorAvailability_specificDate_idx" ON "MentorAvailability"("specificDate");

-- CreateIndex
CREATE INDEX "TimeSlotBooking_availabilityId_idx" ON "TimeSlotBooking"("availabilityId");

-- CreateIndex
CREATE INDEX "TimeSlotBooking_sessionId_idx" ON "TimeSlotBooking"("sessionId");

-- CreateIndex
CREATE INDEX "TimeSlotBooking_status_idx" ON "TimeSlotBooking"("status");

-- CreateIndex
CREATE INDEX "TimeSlotBooking_startTime_endTime_idx" ON "TimeSlotBooking"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "Experience_userId_idx" ON "Experience"("userId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Education_userId_idx" ON "Education"("userId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");

-- CreateIndex
CREATE INDEX "Rating_raterId_idx" ON "Rating"("raterId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_raterId_key" ON "Rating"("userId", "raterId");

-- CreateIndex
CREATE INDEX "Achievement_userId_idx" ON "Achievement"("userId");

-- CreateIndex
CREATE INDEX "Chat_type_idx" ON "Chat"("type");

-- CreateIndex
CREATE INDEX "ChatParticipants_chatId_idx" ON "ChatParticipants"("chatId");

-- CreateIndex
CREATE INDEX "ChatParticipants_userId_idx" ON "ChatParticipants"("userId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Session_requesterId_idx" ON "Session"("requesterId");

-- CreateIndex
CREATE INDEX "Session_requestedId_idx" ON "Session"("requestedId");

-- CreateIndex
CREATE INDEX "Session_serviceId_idx" ON "Session"("serviceId");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_scheduledAt_idx" ON "Session"("scheduledAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_linkedinId_idx" ON "User"("linkedinId");

-- CreateIndex
CREATE INDEX "User_isMentor_idx" ON "User"("isMentor");

-- AddForeignKey
ALTER TABLE "MentorService" ADD CONSTRAINT "MentorService_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAvailability" ADD CONSTRAINT "MentorAvailability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlotBooking" ADD CONSTRAINT "TimeSlotBooking_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "MentorAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlotBooking" ADD CONSTRAINT "TimeSlotBooking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipants" ADD CONSTRAINT "ChatParticipants_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_requestedId_fkey" FOREIGN KEY ("requestedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MentorService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

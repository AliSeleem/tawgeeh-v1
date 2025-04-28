/*
  Warnings:

  - You are about to drop the column `requestedId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `requesterId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the `timeslotbooking` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `menteeId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_requestedId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_requesterId_fkey`;

-- DropForeignKey
ALTER TABLE `timeslotbooking` DROP FOREIGN KEY `TimeSlotBooking_availabilityId_fkey`;

-- DropForeignKey
ALTER TABLE `timeslotbooking` DROP FOREIGN KEY `TimeSlotBooking_sessionId_fkey`;

-- DropIndex
DROP INDEX `Session_requestedId_idx` ON `session`;

-- DropIndex
DROP INDEX `Session_requesterId_idx` ON `session`;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `requestedId`,
    DROP COLUMN `requesterId`,
    ADD COLUMN `menteeId` INTEGER NOT NULL,
    ADD COLUMN `menteeQ` VARCHAR(191) NULL,
    ADD COLUMN `mentorId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `timeslotbooking`;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,

    INDEX `Answer_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Session_menteeId_idx` ON `Session`(`menteeId`);

-- CreateIndex
CREATE INDEX `Session_mentorId_idx` ON `Session`(`mentorId`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_menteeId_fkey` FOREIGN KEY (`menteeId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

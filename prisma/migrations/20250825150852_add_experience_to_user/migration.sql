-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "image_url" SET DEFAULT 'https://campushubs.org/api/uploads/image_url.jpg';

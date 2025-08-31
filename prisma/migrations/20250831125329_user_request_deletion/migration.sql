-- DropForeignKey
ALTER TABLE "MentorRequest" DROP CONSTRAINT "MentorRequest_userId_fkey";

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

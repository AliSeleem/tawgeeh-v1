-- DropForeignKey
ALTER TABLE "MentorRequest" DROP CONSTRAINT "MentorRequest_specializationId_fkey";

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

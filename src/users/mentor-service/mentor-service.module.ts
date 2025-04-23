import { Module } from '@nestjs/common';
import { MentorServiceService } from './mentor-service.service';
import { MentorServiceController } from './mentor-service.controller';
import { QuestionModule } from './question/question.module';
import { MentorAvailabilityModule } from './mentor-availability/mentor-availability.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [QuestionModule, MentorAvailabilityModule, PrismaModule],
  controllers: [MentorServiceController],
  providers: [MentorServiceService],
})
export class MentorServiceModule {}

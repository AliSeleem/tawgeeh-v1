import { Module } from '@nestjs/common';
import { MentorRequestService } from './mentor-request.service';
import { MentorRequestController } from './mentor-request.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MentorRequestController],
  providers: [MentorRequestService],
})
export class MentorRequestModule {}

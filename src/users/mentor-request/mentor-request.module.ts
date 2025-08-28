import { Module } from '@nestjs/common';
import { MentorRequestService } from './mentor-request.service';
import { MentorRequestController } from './mentor-request.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpecializationsModule } from '../specializations/specializations.module';

@Module({
  imports: [PrismaModule, SpecializationsModule],
  controllers: [MentorRequestController],
  providers: [MentorRequestService],
})
export class MentorRequestModule {}

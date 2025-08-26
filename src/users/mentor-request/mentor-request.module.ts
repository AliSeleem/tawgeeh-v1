import { Module } from '@nestjs/common';
import { MentorRequestService } from './mentor-request.service';
import { MentorRequestController } from './mentor-request.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpecializationExistsValidator } from 'src/common/validators/specialization-exists.validator';
import { SpecializationsModule } from '../specializations/specializations.module';

@Module({
  imports: [PrismaModule, SpecializationsModule],
  controllers: [MentorRequestController],
  providers: [MentorRequestService, SpecializationExistsValidator],
})
export class MentorRequestModule {}

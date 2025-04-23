import { Module } from '@nestjs/common';
import { MentorAvailabilityService } from './mentor-availability.service';
import { MentorAvailabilityController } from './mentor-availability.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MentorAvailabilityController],
  providers: [MentorAvailabilityService],
  exports: [MentorAvailabilityService],
})
export class MentorAvailabilityModule {}

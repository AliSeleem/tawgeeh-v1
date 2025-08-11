import { Module } from '@nestjs/common';
import { MentorServiceService } from './mentor-service.service';
import { MentorServiceController } from './mentor-service.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MentorServiceController],
  providers: [MentorServiceService],
})
export class MentorServiceModule {}

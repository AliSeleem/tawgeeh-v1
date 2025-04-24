import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { EducationModule } from './education/education.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { CertificationsModule } from './certifications/certifications.module';
import { AchievementsModule } from './achievements/achievements.module';
import { MentorServiceModule } from './mentor-service/mentor-service.module';
import { MentorRequestModule } from './mentor-request/mentor-request.module';

@Module({
  imports: [
    PrismaModule,
    RatingsModule,
    EducationModule,
    ExperiencesModule,
    CertificationsModule,
    AchievementsModule,
    MentorServiceModule,
    MentorRequestModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { ExploreController } from './explore.controller';
import { UsersModule } from 'src/users/users.module';
import { ExploreService } from './explore.service';
import { ExperiencesModule } from 'src/users/experiences/experiences.module';
import { EducationModule } from 'src/users/education/education.module';
import { CertificationsModule } from 'src/users/certifications/certifications.module';

@Module({
  imports: [
    UsersModule,
    ExperiencesModule,
    EducationModule,
    CertificationsModule,
  ],
  controllers: [ExploreController],
  providers: [ExploreService],
})
export class ExploreModule {}

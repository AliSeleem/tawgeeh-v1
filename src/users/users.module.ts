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
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SpecializationExistsValidator } from 'src/common/validators/specialization-exists.validator';
import { SpecializationsModule } from './specializations/specializations.module';

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
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow only images (jpg, jpeg, png)
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
    SpecializationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, SpecializationExistsValidator],
  exports: [UsersService],
})
export class UsersModule {}

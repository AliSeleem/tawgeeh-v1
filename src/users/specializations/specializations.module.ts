import { Module } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { SpecializationsController } from './specializations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpecializationExistsValidator } from 'src/common/validators/specialization-exists.validator';

@Module({
  imports: [PrismaModule],
  controllers: [SpecializationsController],
  providers: [SpecializationsService, SpecializationExistsValidator],
  exports: [SpecializationsService, SpecializationExistsValidator],
})
export class SpecializationsModule {}

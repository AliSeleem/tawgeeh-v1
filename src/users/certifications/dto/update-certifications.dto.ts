import { PartialType } from '@nestjs/swagger';
import { CreateCertificationsDto } from './create-certifications.dto';

export class UpdateCertificationsDto extends PartialType(
  CreateCertificationsDto,
) {}

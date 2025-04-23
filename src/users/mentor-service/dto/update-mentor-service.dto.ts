import { PartialType } from '@nestjs/swagger';
import { CreateMentorServiceDto } from './create-mentor-service.dto';

export class UpdateMentorServiceDto extends PartialType(
  CreateMentorServiceDto,
) {}

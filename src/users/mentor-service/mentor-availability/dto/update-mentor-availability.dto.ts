import { PartialType } from '@nestjs/swagger';
import { CreateMentorAvailabilityDto } from './create-mentor-availability.dto';

export class UpdateMentorAvailabilityDto extends PartialType(
  CreateMentorAvailabilityDto,
) {}

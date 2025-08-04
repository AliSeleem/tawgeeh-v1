import { OmitType } from '@nestjs/mapped-types';
import { CreateMentorAvailabilityDto } from './create-mentor-availability.dto';

export class NewCreateMentorAvailabilityDto extends OmitType(
  CreateMentorAvailabilityDto,
  ['title'] as const,
) {}

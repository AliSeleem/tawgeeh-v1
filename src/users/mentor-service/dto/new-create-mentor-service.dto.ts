import { OmitType } from '@nestjs/mapped-types';
import { CreateMentorServiceDto } from './create-mentor-service.dto';
import { ApiProperty } from '@nestjs/swagger';
import { NewCreateMentorAvailabilityDto } from '../mentor-availability/dto/new-create-mentor-availability.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NewCreateMentorServiceDto extends OmitType(
  CreateMentorServiceDto,
  ['availabilityIds'] as const,
) {
  @ApiProperty({
    description: 'List of availabilities to connect to the service',
    type: () => NewCreateMentorAvailabilityDto,
  })
  @ValidateNested()
  @Type(() => NewCreateMentorAvailabilityDto)
  availability: NewCreateMentorAvailabilityDto;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { CreateMentorAvailabilityDto } from './create-mentor-availability.dto';

export class CreateMentorServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Mentor Service',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'This is a mentor service',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 30,
  })
  @IsInt()
  @IsIn([30, 45, 60], {
    message: 'Duration must be one of the following values: 30, 45, 60',
  })
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'Service is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'List of questions for the service',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];

  @ApiProperty({
    example: {
      maxDaysBefore: 30,
      minHoursBefore: 24,
      duration: 60,
      maxBookingsPerDay: 5,
      break: true,
      isRecurring: true,
      days: [
        {
          dayOfWeek: 'MONDAY',
          intervals: [{ startTime: '09:00', endTime: '12:00' }],
        },
        {
          dayOfWeek: 'WEDNESDAY',
          intervals: [{ startTime: '14:00', endTime: '17:00' }],
        },
      ],
    },
    description: 'List of availabilities to connect to the service',
    type: () => CreateMentorAvailabilityDto,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateMentorAvailabilityDto)
  availability: CreateMentorAvailabilityDto;
}

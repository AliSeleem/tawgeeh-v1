import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { IsAfterDate } from 'src/common/validators/IsAfterDate';
import { IsSpecificDateRequired } from 'src/common/validators/IsSpecificDateRequired';

export class CreateMentorAvailabilityDto {
  @ApiProperty({
    example: 'Work time',
    description: 'Title for this availability',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @ApiProperty({
    example: 'MONDAY',
    description: 'Day this availability is available on',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  })
  @IsEnum(DayOfWeek)
  @IsNotEmpty({ message: 'Day is required' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    example: '2025-04-27',
    description: 'Time this availability is available from',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'availableFrom must be a date' })
  @IsNotEmpty({ message: 'availableFrom is required' })
  availableFrom: Date;

  @ApiProperty({
    example: '2025-10-27',
    description: 'Date this availability expires on',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'expireAt must be a date' })
  @IsOptional()
  expireAt?: Date;

  @ApiProperty({
    example: 30,
    description: 'Maximum number of days in advance a user can book',
  })
  @IsInt()
  @IsNotEmpty({ message: 'maxDaysBefore is required' })
  maxDaysBefore: number;

  @ApiProperty({
    example: 24,
    description: 'Minimum number of hours before a user can book',
  })
  @IsInt()
  @IsNotEmpty({ message: 'minHoursBefore is required' })
  minHoursBefore: number;

  @ApiProperty({
    example: 5,
    description: 'Maximum number of bookings allowed per day',
  })
  @IsInt()
  @IsNotEmpty({ message: 'maxBookingsPerDay is required' })
  maxBookingsPerDay: number;

  @ApiProperty({
    example: 15,
    description: 'Number of break minutes between sessions',
    required: false,
  })
  @IsInt()
  @IsOptional()
  breakMinutes?: number;

  @ApiProperty({
    example: '2025-04-27T09:00:00Z',
    description: 'Start time of availability (time part only)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'startTime must be a date' })
  @IsNotEmpty({ message: 'startTime is required' })
  startTime: Date;

  @ApiProperty({
    example: '2025-04-27T17:00:00Z',
    description: 'End time of availability (time part only)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'endTime must be a date' })
  @IsNotEmpty({ message: 'endTime is required' })
  @IsAfterDate('startTime', { message: 'endTime must be after startTime' })
  endTime: Date;

  @ApiProperty({
    example: true,
    description: 'Whether this availability is recurring',
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'isRecurring is required' })
  isRecurring: boolean;

  @ApiProperty({
    example: '2025-04-27',
    description: 'Specific date for non-recurring availability',
    required: false,
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'specificDate must be a date' })
  @IsOptional()
  @IsSpecificDateRequired('isRecurring')
  specificDate?: Date;
}

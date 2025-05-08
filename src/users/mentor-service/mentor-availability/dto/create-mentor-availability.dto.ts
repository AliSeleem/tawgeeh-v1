import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class IntervalDto {
  @ApiProperty({
    example: '11:45',
    description: 'Start time of the interval (HH:mm format)',
  })
  @IsString()
  @IsNotEmpty({ message: 'startTime is required' })
  startTime: string;

  @ApiProperty({
    example: '14:00',
    description: 'End time of the interval (HH:mm format)',
  })
  @IsString()
  @IsNotEmpty({ message: 'endTime is required' })
  endTime: string;
}

class DayDto {
  @ApiProperty({
    example: 'SATURDAY',
    description: 'Day of the week for recurring availability',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    required: false,
  })
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    example: '2025-04-27',
    description: 'Specific date for non-recurring availability',
    required: false,
  })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate({ message: 'specificDate must be a date' })
  @IsOptional()
  specificDate?: Date;

  @ApiProperty({
    example: [{ startTime: '11:45', endTime: '14:00' }],
    description: 'List of time intervals for the day',
    type: [IntervalDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntervalDto)
  @IsNotEmpty({ message: 'Intervals are required' })
  intervals: IntervalDto[];
}

export class CreateMentorAvailabilityDto {
  @ApiProperty({
    example: 'Work time',
    description: 'Title for this availability',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

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
    required: false,
  })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
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
    example: true,
    description: 'Whether this availability is recurring',
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'isRecurring is required' })
  isRecurring: boolean;

  @ApiProperty({
    example: [
      {
        dayOfWeek: 'SATURDAY',
        intervals: [{ startTime: '11:45', endTime: '14:00' }],
      },
    ],
    description: 'List of days with their time intervals',
    type: [DayDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  @IsNotEmpty({ message: 'Days are required' })
  days: DayDto[];
}

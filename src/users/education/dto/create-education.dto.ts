import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsAfterDate } from 'src/common/validators/IsAfterDate';

export class CreateEducationDto {
  @ApiProperty({
    example: 'Harvard University',
    description: 'Name of the school (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'School must be at least 2 characters long.' })
  @MaxLength(50, { message: 'School must be at most 50 characters long.' })
  school: string;

  @ApiProperty({
    example: 'Bachelor of Science in Computer Science',
    description: 'Degree obtained (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  degree: string;

  @ApiProperty({
    example: '2020-10-20',
    description: 'Start Date (YYYY-MM)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
    example: '2025-07-15',
    description: 'Date of graduation (YYYY-MM)',
  })
  @IsAfterDate('from', {
    message: 'Graduation date must be after the start date.',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  to: Date;
}

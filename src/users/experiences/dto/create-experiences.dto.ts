import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExperiencesDto {
  @ApiProperty({
    example: 'Developer',
    description: 'Title of the experience (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  @MinLength(2, { message: 'Title must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long.' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'Please enter a valid title.' })
  title: string;

  @ApiProperty({
    example: 'Company Name',
    description:
      'Company name of the experience (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required.' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long.' })
  @MaxLength(50, {
    message: 'Company name must be at most 50 characters long.',
  })
  company: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Start date of the experience (YYYY-MM-DD)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'Start date is required.' })
  from: Date;

  @ApiProperty({
    example: '2023-12-31',
    description: 'End date of the experience (YYYY-MM-DD)',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  to: Date;

  @ApiProperty({
    description: 'check if you still working there',
  })
  @IsBoolean()
  stillThere: boolean;

  @ApiProperty({
    example: 'Description of the experience',
    description: 'Description of the experience (10-500 characters)',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Summary is required.' })
  @MinLength(10, {
    message: 'Summary must be at least 10 characters long.',
  })
  @MaxLength(500, {
    message: 'Summary must be at most 500 characters long.',
  })
  summary: string;
}

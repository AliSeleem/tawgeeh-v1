import { ExperienceLevel, Gender } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of user (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long.' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'Please enter a valid name.' })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({
    example: '01012345678',
    description: 'Egyptian phone number starting with 010, 011, 012, or 015',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^01[0125][0-9]{8}$/, {
    message:
      'Please enter a valid Egyptian phone number starting with 010, 011, 012, or 015.',
  })
  phone: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'User gender',
  })
  @IsString()
  @IsNotEmpty({ message: 'Gender is required.' })
  @IsIn(['MALE', 'FEMALE'], {
    message: 'Gender must be either Male or Female.',
  })
  gender: Gender;

  @ApiProperty({
    example: 'Egypt',
    description: 'Country of residence',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required.' })
  country: string;

  @ApiProperty({
    example: 'Software Engineering',
    description: 'Professional specialization',
  })
  @IsString()
  @IsNotEmpty({ message: 'Specialization is required.' })
  specialization: string;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
    description: 'Professional experience level',
  })
  @IsString()
  @IsNotEmpty({ message: 'Experience level is required.' })
  @IsIn(['BEGINNER', 'INTERMEDIATE', 'EXPERT'], {
    message: 'Please select a valid experience level.',
  })
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    required: false,
    example: 'Full-stack developer with 5 years experience',
    description: 'Optional bio information',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}

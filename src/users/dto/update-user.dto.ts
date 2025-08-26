import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { SpecializationExistsValidator } from 'src/common/validators/specialization-exists.validator';

export class UpdateUserDto {
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
  name: string;

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

  @ApiPropertyOptional({
    example: 'Updated Bio',
    description: 'User biography (optional)',
  })
  @ApiProperty({
    example: 'Egypt',
    description: 'User country (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required.' })
  @MinLength(2, { message: 'Country must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Country must be at most 50 characters long.' })
  country: string;

  @ApiPropertyOptional({
    example: 'This is my bio',
    description: 'User biography (optional)',
  })
  @IsString()
  @MaxLength(500, { message: 'Bio must be at most 500 characters long.' })
  bio?: string;

  @ApiProperty({
    example: 3,
    description: 'Years of experience (non-negative integer)',
  })
  @IsNumber({}, { message: 'Experience must be a number.' })
  @Min(0, { message: 'Experience must be a non-negative integer.' })
  @Max(50, { message: 'Experience must be at most 50 years.' })
  experience?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'User specializationId of specialization (optional)',
  })
  @IsNumber()
  @Validate(SpecializationExistsValidator)
  specializationId?: number;

  @ApiPropertyOptional({
    example: 'https://www.linkedin.com/in/username',
    description: 'LinkedIn profile URL (optional)',
  })
  @IsString()
  @MaxLength(200, {
    message: 'LinkedIn URL must be at most 200 characters long.',
  })
  @Matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, {
    message: 'Please enter a valid LinkedIn URL.',
  })
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({
    example: 'https://www.behance.net/username',
    description: 'Behance profile URL (optional)',
  })
  @IsString()
  @MaxLength(200, {
    message: 'Behance URL must be at most 200 characters long.',
  })
  @Matches(/^(https?:\/\/)?(www\.)?behance\.net\/[a-zA-Z0-9_-]+\/?$/, {
    message: 'Please enter a valid Behance URL.',
  })
  @IsOptional()
  behance?: string;

  @ApiPropertyOptional({
    example: 'https://www.instagram.com/username',
    description: 'Instagram profile URL (optional)',
  })
  @IsString()
  @MaxLength(200, {
    message: 'Instagram URL must be at most 200 characters long.',
  })
  @Matches(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/, {
    message: 'Please enter a valid Instagram URL.',
  })
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/username',
    description: 'GitHub profile URL (optional)',
  })
  @IsString()
  @MaxLength(200, {
    message: 'GitHub URL must be at most 200 characters long.',
  })
  @Matches(/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._]+\/?$/, {
    message: 'Please enter a valid GitHub URL.',
  })
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({
    example: 'https://dribbble.com/username',
    description: 'Dribbble profile URL (optional)',
  })
  @IsString()
  @Matches(/^(https?:\/\/)?(www\.)?dribbble\.com\/[a-zA-Z0-9_-]+\/?$/, {
    message: 'Please enter a valid Dribbble URL.',
  })
  @IsOptional()
  dribbble?: string;
}

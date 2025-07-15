import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { ExperienceLevel } from '../../common/enums/experience-level.enum';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @Matches(/^[A-Za-z\s]+$/, { message: 'Please enter a valid name.' })
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
  @Matches(/^[A-Za-z\s]+$/, { message: 'Please enter a valid country.' })
  country: string;

  @ApiPropertyOptional({
    example: 'This is my bio',
    description: 'User biography (optional)',
  })
  @IsString()
  @MaxLength(500, { message: 'Bio must be at most 500 characters long.' })
  bio?: string;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
    description: 'User experience level',
  })
  @IsNotEmpty({ message: 'Experience level is required.' })
  @IsIn(
    [
      ExperienceLevel.BEGINNER,
      ExperienceLevel.INTERMEDIATE,
      ExperienceLevel.EXPERT,
    ],
    {
      message: 'Experience level must be BEGINNER, INTERMEDIATE, or EXPERT.',
    },
  )
  experienceLevel: ExperienceLevel;

  @ApiPropertyOptional({
    example: 'Other',
    description: 'User specialization (optional)',
  })
  @IsString()
  @MaxLength(100, {
    message: 'Specialization must be at most 100 characters long.',
  })
  specialization?: string;

  // SOCIAL MEDIA (lINKEDIN, BEHANCE, INSTAGRAM, GITHUB)
  @ApiPropertyOptional({
    example: 'https://www.linkedin.com/in/username',
    description: 'LinkedIn profile URL (optional)',
  })
  linkedIn?: string;
  @ApiPropertyOptional({
    example: 'https://www.behance.net/username',
    description: 'Behance profile URL (optional)',
  })
  behance?: string;
  @ApiPropertyOptional({
    example: 'https://www.instagram.com/username',
    description: 'Instagram profile URL (optional)',
  })
  instagram?: string;
  @ApiPropertyOptional({
    example: 'https://github.com/username',
    description: 'GitHub profile URL (optional)',
  })
  github?: string;
}

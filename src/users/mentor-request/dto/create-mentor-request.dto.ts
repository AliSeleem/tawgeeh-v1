import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { SpecializationExistsValidator } from 'src/common/validators/specialization-exists.validator';

export class CreateMentorRequestDto {
  @ApiProperty({
    example: '1',
    description: 'specializationId of the mentee specialization',
  })
  @IsNumber()
  @IsNotEmpty()
  @Validate(SpecializationExistsValidator)
  specializationId: number;

  @ApiProperty({
    example: 3,
    description: 'Years of experience (non-negative integer)',
  })
  @IsNotEmpty({ message: 'Experience years is required.' })
  @IsNumber({}, { message: 'Experience must be a number.' })
  @Min(0, { message: 'Experience must be a non-negative integer.' })
  @Max(50, { message: 'Experience must be at most 50 years.' })
  experience: number;

  @ApiProperty({
    description: 'LinkedIn profile link',
    example: 'https://www.linkedin.com/in/your-profile',
  })
  @IsString()
  @IsNotEmpty()
  linkedin: string;

  @ApiProperty({
    description: 'GitHub profile link',
    example: 'https://github.com/your-profile',
  })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiProperty({
    description: 'dribbble profile link',
    example: 'https://dribbble.com/your-profile',
  })
  @IsString()
  @IsOptional()
  dribbble?: string;

  @ApiProperty({
    description: 'behance profile link',
    example: 'https://www.behance.net/your-profile',
  })
  @IsString()
  @IsOptional()
  behance?: string;

  @ApiProperty({
    description: 'instagram profile link',
    example: 'https://www.instagram.com/your-profile',
  })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({
    description: 'Mentor Bio',
    example:
      'I am a software engineer with 5 years of experience in web development.',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;
}

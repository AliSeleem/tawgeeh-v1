import { ApiProperty } from '@nestjs/swagger';
import { ReqStat } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RequestStatus } from 'src/common/enums/request-status.enum';

export class CreateMentorRequestDto {
  @ApiProperty({
    example: 'BSc in Computer Science, 3 years backend development',
    description: 'specialization of the mentee',
  })
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty({
    example: 'Senior Node.js and NestJS',
    description: 'Description of expertise',
  })
  @IsString()
  @IsNotEmpty()
  experienceLevel: string;

  @ApiProperty({
    example: 'Jounior Node.js developers',
    description: 'Mentee level',
  })
  @IsString()
  @IsNotEmpty()
  TargetMentees: string;

  @ApiProperty({
    description: 'LinkedIn profile link',
    example: 'https://www.linkedin.com/in/your-profile',
  })
  @IsString()
  @IsNotEmpty()
  linkedin: string;

  @ApiProperty({
    description: 'Mentor Bio',
    example:
      'I am a software engineer with 5 years of experience in web development.',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    description: 'Request status',
    example: 'PENDING',
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiProperty({
    description: 'Admin ID',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  reviewedBy?: number;

  @ApiProperty({
    description: 'Review date',
    example: '2025-04-027',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  reviewedAt?: Date;
}

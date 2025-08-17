import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID of the mentor for the session',
    example: '1234567890',
  })
  @IsString()
  mentorId: string;

  @ApiProperty({
    description: 'ID of the mentor service for the session',
    example: 1,
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    description: 'Scheduled date and time for the session',
    example: '2025-05-01T10:00:00Z',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  scheduledAt: Date;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 60,
  })
  @IsInt()
  duration: number;

  @ApiProperty({
    description: 'Mentee answers for the service questions',
    type: [CreateAnswerDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers?: CreateAnswerDto[];

  @ApiProperty({
    description: 'Optional question or note from the mentee',
    example: 'I need help with TypeScript best practices.',
    required: false,
  })
  @IsString()
  @IsOptional()
  menteeQ?: string;
}

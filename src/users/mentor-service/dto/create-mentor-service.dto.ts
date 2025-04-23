import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateQuestionDto } from '../question/dto/create-question.dto';
import { Type } from 'class-transformer';

export class CreateMentorServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Mentor Service',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'This is a mentor service',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 30,
  })
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'Service is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'List of questions for the service',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];

  @ApiProperty({
    description: 'List of availability IDs to connect to the service',
    example: [1, 2],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  availabilityIds?: number[];
}

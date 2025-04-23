import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'The question',
    example: 'How do you think I can help you?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The question type',
    example: 'true',
  })
  @IsBoolean()
  @IsOptional()
  required: boolean;
}

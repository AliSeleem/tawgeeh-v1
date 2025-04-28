import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    description: 'ID of the question being answered',
    example: 1,
  })
  @IsInt()
  questionId: number;

  @ApiProperty({
    description: 'Answer text provided by the mentee',
    example: 'I want to learn about React.',
  })
  @IsString()
  text: string;
}

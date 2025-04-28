import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSessionFeedbackDto {
  @ApiProperty({
    description: 'ID of the session to add feedback to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Feedback provided by the mentee for the session',
    example: 'The mentor was very helpful and clear in explanations.',
  })
  @IsString()
  feedback: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSessionNotesDto {
  @ApiProperty({
    description: 'ID of the session to add notes to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Notes added by the mentor for the session',
    example: 'Discussed TypeScript interfaces and error handling.',
  })
  @IsString()
  notes: string;
}

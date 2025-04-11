import { OmitType } from '@nestjs/swagger'; // Changed from @nestjs/mapped-types
import { RegisterDto } from './register.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRegistrationDto extends OmitType(RegisterDto, [
  'password',
] as const) {
  @ApiProperty({
    required: false,
    example: 'Experienced full-stack developer',
    description: 'User biography (optional)',
  })
  bio?: string;

  @ApiProperty({
    example: '01012345678',
    description: 'Egyptian phone number starting with 010, 011, 012, or 015',
  })
  phone: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
    required: true,
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'ABC123',
    description: 'Password reset code received via email',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset code is required.' })
  @MinLength(6, { message: 'Reset code must be 6 characters long.' })
  resetCode: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  newPassword: string;
}

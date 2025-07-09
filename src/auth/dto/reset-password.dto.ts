import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, NotEquals } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password (minimum 6 characters)',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  newPassword: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'confirm password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required.' })
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long.',
  })
  @NotEquals('newPassword', {
    message: 'Confirm password must match the new password.',
  })
  confirmPassword: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'OldPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Old password is required.' })
  @MinLength(6, { message: 'Old password must be at least 6 characters long.' })
  oldPassword: string;

  @ApiProperty({
    description: 'The new password to set',
    example: 'NewStrongPassword456!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}

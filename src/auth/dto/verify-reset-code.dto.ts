import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetCodeDto {
  @ApiProperty({
    example: '123456',
    description: 'Verification code sent to the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required.' })
  code: string;
}

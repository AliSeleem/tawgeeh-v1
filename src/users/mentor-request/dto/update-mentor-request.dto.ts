import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMentorRequestDto } from './create-mentor-request.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMentorRequestDto extends PartialType(
  CreateMentorRequestDto,
) {
  @ApiProperty({
    description: 'Admin ID',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  reviewedBy?: number;

  @ApiProperty({
    description: 'Review date',
    example: '2025-04-027',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  reviewedAt?: Date;
}

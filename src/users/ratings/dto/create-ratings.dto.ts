import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRatingsDto {
  @ApiProperty({
    example: '4.5',
    description: 'star rating (0-5)',
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Star rating is required.' })
  stars: number;

  @ApiProperty({
    example: 'Great service!',
    description: 'Comment about the rating',
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment is required.' })
  comment: string;
}

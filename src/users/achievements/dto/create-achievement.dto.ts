import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty({
    example: '100 minutes sessions',
    description: 'Name of the achievement (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long.' })
  name: string;

  @ApiProperty({
    example: 'https://unsplash.com/photos/abc123',
    description: 'Link to the image',
  })
  @IsString()
  @IsNotEmpty({ message: 'Image link is required.' })
  @Matches(/^(https?:\/\/[^\s$.?#].[^\s]*)$/, {
    message: 'Please enter a valid URL.',
    each: true,
  })
  image: string;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Date of the achievement (YYYY-MM-DD)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'Date is required.' })
  date: Date;
}

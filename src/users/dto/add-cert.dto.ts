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
import { IsAfterDate } from 'src/common/validators/IsAfterDate';

export class AddCertDto {
  @ApiProperty({
    example: 'React NTI',
    description: 'Name of the experience (2-50 characters, letters only)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long.' })
  name: string;

  @ApiProperty({
    example: 'https://example.com/certificate',
    description: 'Link to the certificate',
  })
  @IsString()
  @IsNotEmpty({ message: 'Link is required.' })
  @Matches(/^(https?:\/\/[^\s$.?#].[^\s]*)$/, {
    message: 'Please enter a valid URL.',
    each: true,
  })
  @MinLength(10, { message: 'Link must be at least 10 characters long.' })
  link: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the donor',
  })
  @IsString()
  @IsNotEmpty({ message: 'Donor is required.' })
  donor: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Date of the certificate (YYYY-MM-DD)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'Date is required.' })
  date: Date;

  @ApiProperty({
    example: '2026-01-01',
    description: 'End date of the certificate (YYYY-MM-DD)',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'expireAt is required.' })
  @IsAfterDate('date', { message: 'Expire date must be after start date.' })
  expireAt: Date;

  @ApiProperty({
    example: '123456789',
    description: 'Number of the certificate',
  })
  @IsString()
  @IsNotEmpty({ message: 'Number is required.' })
  number: string;
}

import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecializationCategoryDto {
  @ApiProperty({
    description: 'The name of the specialization category',
    example: 'Cardiology',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description of the specialization category',
    example: 'Specialization in heart and cardiovascular treatments',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSpecializationCategoryDto {
  @ApiPropertyOptional({
    description: 'The updated name of the specialization category',
    example: 'Neurology',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'The updated description of the specialization category',
    example: 'Specialization in brain and nervous system treatments',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

import { IsString, IsOptional, Length, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecializationDto {
  @ApiProperty({
    description: 'The name of the specialization',
    example: 'Pediatric Cardiology',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'The ID of the specialization category',
    example: 1,
  })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Optional description of the specialization',
    example: 'Focuses on heart diseases in children',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSpecializationDto {
  @ApiPropertyOptional({
    description: 'The updated name of the specialization',
    example: 'Neonatal Neurology',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'The updated ID of the specialization category',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'The updated description of the specialization',
    example: 'Deals with nervous system disorders in newborns',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

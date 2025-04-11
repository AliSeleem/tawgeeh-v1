import { PartialType } from '@nestjs/swagger'; // Changed from @nestjs/mapped-types
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'Updated Bio',
    description: 'User biography (optional)',
  })
  bio?: string;
}

import { PartialType } from '@nestjs/swagger'; // Changed from @nestjs/mapped-types
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'Updated Bio',
    description: 'User biography (optional)',
  })
  bio?: string;
  // SOCIAL MEDIA (lINKEDIN, BEHANCE, INSTAGRAM, GITHUB)
  @ApiPropertyOptional({
    example: 'https://www.linkedin.com/in/username',
    description: 'LinkedIn profile URL (optional)',
  })
  linkedIn?: string;
  @ApiPropertyOptional({
    example: 'https://www.behance.net/username',
    description: 'Behance profile URL (optional)',
  })
  behance?: string;
  @ApiPropertyOptional({
    example: 'https://www.instagram.com/username',
    description: 'Instagram profile URL (optional)',
  })
  instagram?: string;
  @ApiPropertyOptional({
    example: 'https://github.com/username',
    description: 'GitHub profile URL (optional)',
  })
  github?: string;
}

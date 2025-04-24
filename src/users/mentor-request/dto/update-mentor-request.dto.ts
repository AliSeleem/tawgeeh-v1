import { PartialType } from '@nestjs/swagger';
import { CreateMentorRequestDto } from './create-mentor-request.dto';

export class UpdateMentorRequestDto extends PartialType(
  CreateMentorRequestDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { NewCreateMentorServiceDto } from './new-create-mentor-service.dto';

export class NewUpdateMentorServiceDto extends PartialType(
  NewCreateMentorServiceDto,
) {}

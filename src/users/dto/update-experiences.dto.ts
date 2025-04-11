import { PartialType } from '@nestjs/swagger';
import { AddExperienceDto } from './add-experiences.dto';

export class UpdateExperienceDto extends PartialType(AddExperienceDto) {}

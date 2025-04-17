import { PartialType } from '@nestjs/swagger';
import { CreateExperiencesDto } from './create-experiences.dto';

export class UpdateExperiencesDto extends PartialType(CreateExperiencesDto) {}

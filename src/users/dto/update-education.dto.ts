import { PartialType } from '@nestjs/swagger';
import { addEducationDto } from './add-education.dto';

export class UpdateEducationDto extends PartialType(addEducationDto) {}

import { PartialType } from '@nestjs/swagger';
import { AddCertDto } from './add-cert.dto';

export class UpdateCertDto extends PartialType(AddCertDto) {}

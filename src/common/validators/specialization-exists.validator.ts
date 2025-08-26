// specialization-exists.validator.ts
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { SpecializationsService } from '../../users/specializations/specializations.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class SpecializationExistsValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly specializationService: SpecializationsService) {}

  async validate(specializationId: number): Promise<boolean> {
    // check if specialization exists in DB
    const specialization =
      await this.specializationService.findOneSpecialization(specializationId);
    return !!specialization; // true if exists
  }

  defaultMessage(args: ValidationArguments): string {
    return `Specialization with id ${args.value} does not exist.`;
  }
}

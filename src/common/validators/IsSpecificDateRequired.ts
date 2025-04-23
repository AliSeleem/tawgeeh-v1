import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsSpecificDateRequired(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSpecificDateRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const isRecurring = (args.object as any)[relatedPropertyName];

          // If isRecurring is true, specificDate is optional (can be undefined)
          if (isRecurring === true) {
            return true;
          }

          // If isRecurring is false, specificDate must be a valid Date
          return value instanceof Date;
        },
        defaultMessage(args: ValidationArguments) {
          return 'specificDate is required for non-recurring availability';
        },
      },
    });
  };
}

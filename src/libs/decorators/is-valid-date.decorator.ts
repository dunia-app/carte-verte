import { registerDecorator, ValidationOptions } from 'class-validator'
import { isValidDate } from '../../helpers/date.helper'

/**
 * Checks if a value is a valid date, handling leap year,
 * required format: YYYY/MM/DD or YYYY-MM-DD
 */
export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message:
          '$property must be a valid date (Required format: YYYY/MM/DD or YYYY-MM-DD)',
        ...validationOptions,
      },
      validator: {
        validate(value: Date) {
          return isValidDate(value)
        },
      },
    })
  }
}

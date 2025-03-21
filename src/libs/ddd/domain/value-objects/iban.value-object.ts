import { logger } from '../../../../helpers/application.helper'
import { removeWhitespace } from '../../../../helpers/string.helper'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export class Iban extends ValueObject<string> {
  constructor(value: string) {
    const formattedValue = Iban.format(value)
    super({ value: formattedValue })
    this.props.value = formattedValue
  }

  get value(): string {
    return this.props.value
  }
  get masked(): string {
    const maskedPart = this.props.value
      .substring(4, this.props.value.length - 3)
      .replace(/\d/g, '*')
    return (
      this.props.value.substring(0, 4) +
      maskedPart +
      this.props.value.substring(this.props.value.length - 3)
    )
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 27, 27)) {
      logger.error(`IBAN ${value} is not 27 characters long`)
    }
  }

  static format(iban: string): string {
    return removeWhitespace(iban.toUpperCase())
  }
}

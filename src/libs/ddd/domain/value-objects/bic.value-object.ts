import { ArgumentOutOfRangeException } from '../../../exceptions/index'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export class Bic extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = Bic.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 8, 11)) {
      throw new ArgumentOutOfRangeException('Bic')
    }
  }

  static format(bic: string): string {
    return bic.trim().toUpperCase()
  }
}

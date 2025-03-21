import { ArgumentOutOfRangeException } from '../../../exceptions/index'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export class Tel extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = Tel.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 0, 15)) {
      throw new ArgumentOutOfRangeException('Tel')
    }
  }

  static format(tel: string): string {
    return tel.trim().toUpperCase()
  }
}

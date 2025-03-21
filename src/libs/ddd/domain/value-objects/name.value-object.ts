import { ArgumentOutOfRangeException } from '../../../exceptions/index'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export class OrganizationName extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = OrganizationName.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 2, 320)) {
      throw new ArgumentOutOfRangeException('Name')
    }
  }

  static format(name: string): string {
    return name.trim().toLowerCase()
  }
}

import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { Guard } from '../../../../libs/ddd/domain/guard'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'

export class BaasUserId extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = BaasUserId.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 5, 25)) {
      throw new ArgumentOutOfRangeException('BaasUserId')
    }
  }

  static format(baasUserId: string): string {
    return baasUserId.trim().toLowerCase()
  }
}

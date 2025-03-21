import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { Guard } from '../../../../libs/ddd/domain/guard'
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from '../../../../libs/exceptions/index'

export class BaasAuthorizationResponseCode extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = BaasAuthorizationResponseCode.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 1, 2)) {
      throw new ArgumentOutOfRangeException('BaasAuthorizationResponseCode')
    }
    if (!isFinite(Number(value))) {
      throw new ArgumentInvalidException(
        'BaasAuthorizationResponseCode is not a number',
      )
    }
  }

  static format(baasAuthorizationResponseCode: string): string {
    return baasAuthorizationResponseCode.trim().toLowerCase()
  }
}

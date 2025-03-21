import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { Guard } from '../../../../libs/ddd/domain/guard'
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from '../../../../libs/exceptions/index'

export class MCC extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = MCC.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 1, 4)) {
      throw new ArgumentOutOfRangeException('MCC')
    }
    if (!isFinite(Number(value))) {
      throw new ArgumentInvalidException('MCC is not a number')
    }
  }

  static format(mcc: string): string {
    return mcc.toString().trim().toLowerCase()
  }
}

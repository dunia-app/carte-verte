import { toScale } from '../../../../helpers/math.helper'
import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { ArgumentInvalidException } from '../../../../libs/exceptions/index'

export class Balance extends ValueObject<number> {
  constructor(value: number) {
    super({ value })
    this.props.value = toScale(Number(value), 2)
  }

  get value(): number {
    return Number(this.props.value)
  }

  protected validate({ value }: DomainPrimitive<number>): void {
    if (!isFinite(value)) {
      throw new ArgumentInvalidException('Balance is not a number')
    }
  }
}

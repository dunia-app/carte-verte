import { UnprocessableEntityException } from '@nestjs/common'
import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'

export class PinCode extends ValueObject<string> {
  constructor(newPin: string, confirmPin: string) {
    super({ value: newPin })
    if (newPin !== confirmPin) {
      throw new UnprocessableEntityException(
        'New pin code and confirm pin are not the same',
      )
    }
    this.props.value = newPin
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (value.length !== 4) {
      throw new ArgumentOutOfRangeException('PinCode must be 4 long')
    }
    if (Number.isNaN(Number(value))) {
      throw new ArgumentOutOfRangeException('PinCode must be a number')
    }
  }
}

import { removeWhitespace } from '../../../../helpers/string.helper'
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from '../../../exceptions/index'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export class Email extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = Email.format(value)
  }

  get value(): string {
    return removeWhitespace(this.props.value)
  }

  protected validate({ value }: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(value, 5, 320)) {
      throw new ArgumentOutOfRangeException('Email')
    }
    if (!/^[\w-\.+]+@([\w-]+\.)+[\w-]{2,8}$/g.test(value)) {
      throw new ArgumentInvalidException('Email has incorrect format')
    }
  }

  static format(email: string): string {
    return email.replace(/\s/g, '').toLowerCase()
  }
}

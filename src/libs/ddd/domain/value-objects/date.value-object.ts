import moment = require('moment')
import { isValidDate } from '../../../../helpers/date.helper'
import { ArgumentInvalidException } from '../../../exceptions/index'
import { DomainPrimitive, ValueObject } from '../base-classes/value-object.base'

export class DateVO extends ValueObject<Date> {
  constructor(value: Date | string | number) {
    const date = new Date(value)
    super({ value: date })
  }

  public get value(): Date {
    return this.props.value
  }

  public get date(): string {
    return moment(this.props.value).format('YYYY-MM-DD')
  }

  public static now(): DateVO {
    return new DateVO(Date.now())
  }

  protected validate({ value }: DomainPrimitive<Date>): void {
    if (
      !(value instanceof Date) ||
      Number.isNaN(value.getTime()) ||
      !isValidDate(value)
    ) {
      throw new ArgumentInvalidException('Incorrect date')
    }
  }
}

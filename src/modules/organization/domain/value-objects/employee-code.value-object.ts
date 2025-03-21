import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'

export class EmployeeCode extends ValueObject<string> {
  constructor(value: string) {
    super({ value })
    this.props.value = EmployeeCode.format(value)
  }

  get value(): string {
    return this.props.value
  }

  protected validate({ value }: DomainPrimitive<string>): void {}

  static format(name: string): string {
    return name
  }
}

import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'

export class Variables extends ValueObject<TWithStringKeys> {
  constructor(value: TWithStringKeys) {
    super({ value })
    this.props.value = value
  }

  get value(): TWithStringKeys {
    return this.props.value
  }

  protected validate(props: TWithStringKeys): void {}
}

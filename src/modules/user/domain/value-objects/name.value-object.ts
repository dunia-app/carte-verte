import { capitalize } from '../../../../helpers/string.helper'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { Guard } from '../../../../libs/ddd/domain/guard'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'

export interface NameProps {
  firstname: string
  lastname: string
}

export class Name extends ValueObject<NameProps> {
  get firstname(): string {
    return capitalize(this.props.firstname)
  }
  get lastname(): string {
    return capitalize(this.props.lastname)
  }

  protected validate(props: NameProps): void {
    if (!Guard.lengthIsBetween(props.firstname, 2, 60)) {
      throw new ArgumentOutOfRangeException('firstname')
    }
    if (!Guard.lengthIsBetween(props.lastname, 2, 60)) {
      throw new ArgumentOutOfRangeException('lastname')
    }
  }
}

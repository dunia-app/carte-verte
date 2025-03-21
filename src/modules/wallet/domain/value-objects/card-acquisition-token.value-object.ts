import { decrypt, encrypt } from '../../../../helpers/crypt.helper'
import {
  DomainPrimitive,
  ValueObject,
} from '../../../../libs/ddd/domain/base-classes/value-object.base'

export class CardAcquisitionToken extends ValueObject<string> {
  get value(): string {
    return this.props.value
  }

  getDecryptedValue(secret: string, salt: string): string {
    return CardAcquisitionToken.decrypt(this.value, secret, salt)
  }

  static generate(
    value: string,
    secret: string,
    salt: string,
  ): CardAcquisitionToken {
    return new CardAcquisitionToken({
      value: CardAcquisitionToken.encrypt(value, secret, salt),
    })
  }

  static encrypt(token: string, secret: string, salt: string) {
    return encrypt(token, secret, salt)
  }

  static decrypt(token: string, secret: string, salt: string) {
    return decrypt(token, secret, salt)
  }

  protected validate({ value }: DomainPrimitive<string>): void {}
}

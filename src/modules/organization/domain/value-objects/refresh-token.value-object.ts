import { compareSync, hashSync } from 'bcrypt'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
const cryptoRandomString = require('crypto-random-string')
import moment = require('moment')

export interface RefreshTokenProps {
  token: string
  expiresIn: Date
  deviceId?: string
}

const refreshTokenLength = 16
const monthBeforeExpire = 7

export class RefreshToken extends ValueObject<RefreshTokenProps> {
  get isNotExpired(): boolean {
    return this.props.expiresIn.valueOf() >= new Date().valueOf()
  }

  get isEncrypted(): boolean {
    return this.props.token.length !== refreshTokenLength
  }

  get deviceId(): string | undefined {
    return this.props.deviceId
  }

  isTokenCorrect(token: string): boolean {
    return compareSync(token, this.props.token) && this.isNotExpired
  }

  static generate(
    saltRound: number,
    deviceId?: string,
    oldToken?: RefreshToken,
  ) {
    // We want someone to get new refreshToken indefinitely without login
    const refreshToken = new RefreshToken({
      token: cryptoRandomString({
        length: refreshTokenLength,
        type: 'url-safe',
      }),
      expiresIn: moment().add(monthBeforeExpire, 'months').toDate(),
      deviceId: oldToken ? oldToken.props.deviceId : deviceId ? deviceId : '',
    })
    const unencryptedToken = refreshToken.props.token
    refreshToken.encrypt(saltRound)
    return { refreshToken, unencryptedToken }
  }

  private encrypt(saltRound: number) {
    if (!this.isEncrypted) {
      this.props.token = hashSync(this.props.token, saltRound)
    }
  }

  protected validate(props: RefreshTokenProps): void {}
}

import { ExceptionBase } from '../../libs/exceptions/index'

export class TokenExpiredError extends ExceptionBase {
  static readonly message = 'Token expired. Try again'

  public readonly code: string = 'TOKEN.EXPIRED'

  constructor(metadata?: unknown) {
    super(TokenExpiredError.message, metadata)
  }
}

import { ExceptionBase } from '../../../libs/exceptions/index'

export class CardPaymentAlreadyCompletedError extends ExceptionBase {
  static readonly message = 'Card already completed'

  public readonly code: string = 'CARD.ALREADY_COMPLETED'

  constructor(metadata?: unknown) {
    super(CardPaymentAlreadyCompletedError.message, metadata)
  }
}

export class CardPaymentAlreadyExpiredError extends ExceptionBase {
  static readonly message = 'Card already expired'

  public readonly code: string = 'CARD.ALREADY_EXPIRED'

  constructor(metadata?: unknown) {
    super(CardPaymentAlreadyExpiredError.message, metadata)
  }
}

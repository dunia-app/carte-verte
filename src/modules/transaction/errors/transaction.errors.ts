import { ExceptionBase } from '../../../libs/exceptions/index'

export class TransactionAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Transaction already exists'

  public readonly code: string = 'TRANSACTION.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(TransactionAlreadyExistsError.message, metadata)
  }
}

export class TransactionAlreadyExpiredError extends ExceptionBase {
  static readonly message = 'Transaction already expired'

  public readonly code: string = 'TRANSACTION.ALREADY_EXPIRED'

  constructor(metadata?: unknown) {
    super(TransactionAlreadyExpiredError.message, metadata)
  }
}

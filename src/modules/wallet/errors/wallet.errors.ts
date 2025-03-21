import { ExceptionBase } from '../../../libs/exceptions/index'

export class WalletNotEnoughBalanceError extends ExceptionBase {
  static readonly message = 'Wallet has not enough balance'

  public readonly code: string = 'WALLET.NOT_ENOUGH_BALANCE'

  constructor(metadata?: unknown) {
    super(WalletNotEnoughBalanceError.message, metadata)
  }
}

export class WalletNotEnoughAuthorizedBalanceError extends ExceptionBase {
  static readonly message = 'Wallet has not enough authorized balance'

  public readonly code: string = 'WALLET.NOT_ENOUGH_AUTHORIZED_BALANCE'

  constructor(metadata?: unknown) {
    super(WalletNotEnoughAuthorizedBalanceError.message, metadata)
  }
}

export class WalletAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Wallet already exists'

  public readonly code: string = 'WALLET.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(WalletAlreadyExistsError.message, metadata)
  }
}

export class WalletDefaultError extends ExceptionBase {
  static readonly message = 'Error in wallet'

  public readonly code: string = 'WALLET.DEFAULT_ERROR'

  constructor(metadata?: unknown) {
    super(WalletDefaultError.message, metadata)
  }
}
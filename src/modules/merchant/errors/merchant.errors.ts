import { ExceptionBase } from '../../../libs/exceptions/index'

export class MerchantNotFoundError extends ExceptionBase {
  static readonly message = 'Merchant has not been found'

  public readonly code: string = 'MERCHANT.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(MerchantNotFoundError.message, metadata)
  }
}
export class MccNotFoundError extends ExceptionBase {
  static readonly message = 'Mcc has not been found'

  public readonly code: string = 'MCC.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(MccNotFoundError.message, metadata)
  }
}

export class MerchantSiretNotFoundError extends ExceptionBase {
  static readonly message = 'Siret has not been found for merchant'

  public readonly code: string = 'MERCHANT.SIRET_NOT_FOUND'

  constructor(metadata?: unknown) {
    super(MerchantSiretNotFoundError.message, metadata)
  }
}

export class DefaultMerchantError extends ExceptionBase {
  static readonly message = 'Something went wrong'

  public readonly code: string = 'MERCHANT.DEFAULT_ERROR'

  constructor(metadata?: unknown) {
    super(`DefaultMerchantError.message : ${metadata}`, metadata)
  }
}

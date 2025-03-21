import { ExceptionBase } from '../../../libs/exceptions/index'

export class CardAcquisitionAlreadyExistsError extends ExceptionBase {
  static readonly message = 'CardAcquisition already exists'

  public readonly code: string = 'CARD_ACQUISITION.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(CardAcquisitionAlreadyExistsError.message, metadata)
  }
}

export class CardAcquisitionNoAuthorizedOverdraftError extends ExceptionBase {
  static readonly message =
    'CardAcquisition no authorized overdraft found or provided'

  public readonly code: string =
    'CARD_ACQUISITION.AUTHORIZED_OVERDRAFT_NOT_FOUND'

  constructor(metadata?: unknown) {
    super(CardAcquisitionAlreadyExistsError.message, metadata)
  }
}

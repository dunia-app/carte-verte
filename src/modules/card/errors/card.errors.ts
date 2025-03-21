import { ExceptionBase } from '../../../libs/exceptions/index'

export class CardAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Card already exists'

  public readonly code: string = 'CARD.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(CardAlreadyExistsError.message, metadata)
  }
}
export class CardAlreadyActivatedError extends ExceptionBase {
  static readonly message = 'Card already activated'

  public readonly code: string = 'CARD.ALREADY_ACTIVATED'

  constructor(metadata?: unknown) {
    super(CardAlreadyActivatedError.message, metadata)
  }
}

export class CardPinAlreadySetError extends ExceptionBase {
  static readonly message = 'Card Pin already set'

  public readonly code: string = 'CARD.PIN_ALREADY_SET'

  constructor(metadata?: unknown) {
    super(CardPinAlreadySetError.message, metadata)
  }
}

export class CardPinNotSetError extends ExceptionBase {
  static readonly message = 'Card Pin not set'

  public readonly code: string = 'CARD.PIN_NOT_SET'

  constructor(metadata?: unknown) {
    super(CardPinNotSetError.message, metadata)
  }
}

export class CardPinFormatNotCorrectError extends ExceptionBase {
  static readonly message =
    'Card Pin format not correct. PinCode must be a 4 long number.'

  public readonly code: string = 'CARD.PIN_FORMAT_NOT_CORRECT'

  constructor(metadata?: unknown) {
    super(CardPinFormatNotCorrectError.message, metadata)
  }
}

export class CardAlreadyConvertedError extends ExceptionBase {
  static readonly message = 'Card already converted to physical'

  public readonly code: string = 'CARD.ALREADY_CONVERTED'

  constructor(metadata?: unknown) {
    super(CardAlreadyConvertedError.message, metadata)
  }
}

export class CardNotUnlockedError extends ExceptionBase {
  static readonly message =
    'This card is not unlocked and needs to be to do this operation.'

  public readonly code: string = 'CARD.NOT_UNLOCKED'

  constructor(metadata?: unknown) {
    super(CardNotUnlockedError.message, metadata)
  }
}

export class CardNotLockedError extends ExceptionBase {
  static readonly message =
    'Only possible to unlock locked cards. Blocking a card is definitive.'

  public readonly code: string = 'CARD.NOT_LOCKED'

  constructor(metadata?: unknown) {
    super(CardNotLockedError.message, metadata)
  }
}

export class CardAlreadyBlockedError extends ExceptionBase {
  static readonly message = 'Card is already blocked'

  public readonly code: string = 'CARD.ALREADY_BLOCKED'

  constructor(metadata?: unknown) {
    super(CardAlreadyBlockedError.message, metadata)
  }
}

export class CardAlreadyLockedError extends ExceptionBase {
  static readonly message = 'Card is already locked'

  public readonly code: string = 'CARD.ALREADY_LOCKED'

  constructor(metadata?: unknown) {
    super(CardAlreadyLockedError.message, metadata)
  }
}

export class CardAlreadyUnlockedError extends ExceptionBase {
  static readonly message = 'Card is already unlocked'

  public readonly code: string = 'CARD.ALREADY_UNLOCKED'

  constructor(metadata?: unknown) {
    super(CardAlreadyUnlockedError.message, metadata)
  }
}

export class CardNotFoundError extends ExceptionBase {
  static readonly message = 'Card not found'

  public readonly code: string = 'CARD.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(CardNotFoundError.message, metadata)
  }
}

export class CardDigitalizationAlreadyAddedError extends ExceptionBase {
  static readonly message = 'CardDigitalization already added'

  public readonly code: string = 'CARD_DIGITALIZATION.ALREADY_DATED'

  constructor(metadata?: unknown) {
    super(CardDigitalizationAlreadyAddedError.message, metadata)
  }
}

export class CardDigitalizationAlreadyInitiatedError extends ExceptionBase {
  static readonly message =
    'CardDigitalization already initiated. Please wait before next initiation.'

  public readonly code: string = 'CARD_DIGITALIZATION.ALREADY_INITIATED'

  constructor(metadata?: unknown) {
    super(CardDigitalizationAlreadyInitiatedError.message, metadata)
  }
}

export class CardConversionAlreadyInitiatedError extends ExceptionBase {
  static readonly message =
    'CardConversion already initiated. Please wait before next initiation.'

  public readonly code: string = 'CARD_CONVERSION.ALREADY_INITIATED'

  constructor(metadata?: unknown) {
    super(CardConversionAlreadyInitiatedError.message, metadata)
  }
}

export class CardConversionNotInitiatedError extends ExceptionBase {
  static readonly message =
    'CardConversion not initiated. Please initiate conversion before confirming.'

  public readonly code: string = 'CARD_CONVERSION.NOT_INITIATED'

  constructor(metadata?: unknown) {
    super(CardConversionNotInitiatedError.message, metadata)
  }
}

export class CardConversionAlreadyCompletedError extends ExceptionBase {
  static readonly message =
    'CardConversion already completed. Each card can be convert once only.'

  public readonly code: string = 'CARD_CONVERSION.ALREADY_COMPLETED'

  constructor(metadata?: unknown) {
    super(CardConversionAlreadyCompletedError.message, metadata)
  }
}

export class CardConversionAlreadyCoveredError extends ExceptionBase {
  static readonly message = 'CardConversion already covered.'

  public readonly code: string = 'CARD_CONVERSION.ALREADY_COVERED'

  constructor(metadata?: unknown) {
    super(CardConversionAlreadyCoveredError.message, metadata)
  }
}

export class CardDigitalizationAlreadyAddedToDeviceError extends ExceptionBase {
  static readonly message = 'CardDigitalization already added to device.'

  public readonly code: string = 'CARD_CONVERSION.ALREADY_ADDED'

  constructor(metadata?: unknown) {
    super(CardDigitalizationAlreadyAddedToDeviceError.message, metadata)
  }
}

export class CardDigitalizationNotFoundError extends ExceptionBase {
  static readonly message = 'CardDigitalization not found'

  public readonly code: string = 'CARD_DIGITALIZATION.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(CardDigitalizationNotFoundError.message, metadata)
  }
}

export class CardDigitalizationAlreadyCompletedError extends ExceptionBase {
  static readonly message = 'CardDigitalization already completed'

  public readonly code: string = 'CARD_CONVERSION.ALREADY_COMPLETED'

  constructor(metadata?: unknown) {
    super(CardDigitalizationAlreadyCompletedError.message, metadata)
  }
}

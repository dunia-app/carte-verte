import { ExceptionBase } from '../../../libs/exceptions/index'

export class NotificationResponseAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Notification response already exists'

  public readonly code: string = 'NOTIFICATION.RESPONSE_ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(NotificationResponseAlreadyExistsError.message, metadata)
  }
}

export class NotificationAlreadyReceivedError extends ExceptionBase {
  static readonly message = 'Notification already received'

  public readonly code: string = 'NOTIFICATION.ALREADY_RECEIVED'

  constructor(metadata?: unknown) {
    super(NotificationAlreadyReceivedError.message, metadata)
  }
}

export class NotificationAlreadySentError extends ExceptionBase {
  static readonly message = 'Notification already sent'

  public readonly code: string = 'NOTIFICATION.ALREADY_SENT'

  constructor(metadata?: unknown) {
    super(NotificationAlreadySentError.message, metadata)
  }
}

export class NotificationIsNotInAppTypeError extends ExceptionBase {
  static readonly message = 'Notification is not InApp type'

  public readonly code: string = 'NOTIFICATION.IS_NOT_IN_APP_TYPE'

  constructor(metadata?: unknown) {
    super(NotificationIsNotInAppTypeError.message, metadata)
  }
}
